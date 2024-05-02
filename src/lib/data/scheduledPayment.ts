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
      const paymentOverview = await prisma.paymentOverview.findUnique({
        where: {
          id: payment?.paymentOverviewId,
        },
      });
      let lateFee = 0;

      if (paymentOverview?.lateFee) {
        lateFee = Number(paymentOverview?.lateFee);
      } else if (paymentOverview?.lateFeePercent) {
        lateFee =
          Number(paymentOverview?.totalSale) *
          (Number(paymentOverview?.lateFeePercent) / 100);
      }
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
            increment: -lateFee,
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
  
        const paymentOverview = await prisma.paymentOverview.findUnique({
          where: {
            id: payment?.paymentOverviewId,
          },
        });
        let lateFee = 0;

        if (paymentOverview?.lateFee) {
          lateFee = Number(paymentOverview?.lateFee);
        } else if (paymentOverview?.lateFeePercent) {
          lateFee =
            Number(paymentOverview?.totalSale) *
            (Number(paymentOverview?.lateFeePercent) / 100);
        }
        await prisma.paymentOverview.update({
          where: {
            id: payment.paymentOverviewId,
          },
          data: {
            net: {
              increment: lateFee,
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
