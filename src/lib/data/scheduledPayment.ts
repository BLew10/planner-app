"use server";

import prisma from "@/lib/prisma/prisma";
import { ScheduledPayment } from "@prisma/client";

export const getScheduledPaymentsByContactIdAndYear = async (
  contactId: string,
  year: String
): Promise<ScheduledPayment[] | null> => {
  try {
    const payments = await prisma.scheduledPayment.findMany({
      where: {
        paymentOverview: {
          year: Number(year),
          contactId: contactId,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });
    return payments;
  } catch (e) {
    return null;
  }
};

export const updateSchedulePaymentLateFeesByYear = async (
  paymentIdsToWaive: string[],
  year: string
) => {
  try {
    await prisma.scheduledPayment.updateMany({
      where: {
        id: {
          in: paymentIdsToWaive,
        },
        paymentOverview: {
          year: Number(year),
        },
      },
      data: {
        lateFeeWaived: true,
      },
    });

    for (const paymentId of paymentIdsToWaive) {
      const payment = await prisma.scheduledPayment.findUnique({
        where: {
          id: paymentId,
          lateFeeAddedToNet: true,
        },
      });

      if (!payment) continue;

      await prisma.scheduledPayment.update({
        where: {
          id: paymentId,
        },
        data: {
          lateFeeAddedToNet: false,
        },
      });

      await prisma.paymentOverview.update({
        where: {
          id: payment.paymentOverviewId,
        },
        data: {
          net: {
            increment: -Number(payment.lateFee || 0),
          },
        },
      });
    }

    const notWaived = await prisma.scheduledPayment.findMany({
      where: {
        year: Number(year),
        id: {
          notIn: paymentIdsToWaive,
        },
      },
    });

    for (const payment of notWaived) {
      await prisma.scheduledPayment.update({
        where: {
          id: payment.id,
        },
        data: {
          lateFeeWaived: false,
        },
      })
      if (!payment.lateFeeAddedToNet && payment.isLate) {
        await prisma.scheduledPayment.update({
          where: {
            id: payment.id,
          },
          data: {
            lateFeeAddedToNet: true,
          },
        });
  
        await prisma.paymentOverview.update({
          where: {
            id: payment.paymentOverviewId,
          },
          data: {
            net: {
              increment: Number(payment.lateFee || 0),
            },
          },
        });
      }
    }

    return true;
  } catch (e) {
    console.error("Error updating payments:", e);
    return false;
  }
};
