"use server";

import prisma from "@/lib/prisma/prisma";
import { ScheduledPayment } from "@prisma/client";
import { serializeReturn } from "../helpers";

export const getScheduledPaymentsByContactIdAndYear = async (
  contactId: string,
  calendarEditionYear: string
): Promise<ScheduledPayment[] | null> => {
  try {
    const payments = await prisma.scheduledPayment.findMany({
      where: {
        paymentOverview: {
          calendarEditionYear: Number(calendarEditionYear),
          contactId: contactId,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });
    return serializeReturn(payments);
  } catch (e) {
    return null;
  }
};

export const updateSchedulePaymentLateFeesByYear = async (
  paymentUpdates: { id: string; waived: boolean }[]
) => {
  try {
    const paymentsToWaive = paymentUpdates
      .filter((update) => update.waived)
      .map((update) => update.id);

    const paymentsToUnwaive = paymentUpdates
      .filter((update) => !update.waived)
      .map((update) => update.id);

    await prisma.scheduledPayment.updateMany({
      where: {
        id: {
          in: paymentsToWaive,
        },
      },
      data: {
        lateFeeWaived: true,
      },
    });

    for (const paymentId of paymentsToWaive) {
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
        id: {
          in: paymentsToUnwaive,
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
      });

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
