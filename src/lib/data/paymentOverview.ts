"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { PaymentOverviewModel } from "../models/paymentOverview";
import { isLate, serializeReturn } from "../helpers";

export const getPaymentOverviewById = async (
  id: string
): Promise<Partial<PaymentOverviewModel> | null> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const payment = await prisma.paymentOverview.findFirst({
      where: {
        id,
        userId
      },
      include: {
        purchase: true,
        scheduledPayments: true,
        payments: true,
      },
    });
    return serializeReturn(payment);
  } catch (e) {
    return null;
  }
};

export const getOwedPayments = async (year: string, search?: string) => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    console.error("User is not authenticated.");
    return null;
  }

  try {
    await flagLatePayments(userId);
    const payments = await prisma.paymentOverview.findMany({
      where: {
        userId,
        year: Number(year),
        isPaid: false,
        OR: search
          ? [
              {
                contact: {
                  contactContactInformation: {
                    firstName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                contact: {
                  contactContactInformation: {
                    lastName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                contact: {
                  contactContactInformation: {
                    company: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                contact: {
                  contactTelecomInformation: {
                    email: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                invoiceNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ]
          : undefined,
      },
      include: {
        contact: {
          include: {
            contactContactInformation: true,
            contactTelecomInformation: true,
          },
        },
        scheduledPayments: {
          orderBy: {
            dueDate: "asc",
          },
        },
        payments: true,
        purchase: {
          include: {
            adPurchases: {
              include: {
                calendar: true,
                advertisement: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          contact: {
            contactContactInformation: {
              company: "asc",
            },
          },
        },
        {
          year: "asc",
        },
      ],
    });

    return serializeReturn(payments);
  } catch (e) {
    console.error("Error getting owed payments", e);
    return null;
  }
};

export const flagLatePayments = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (user) {
    const alreadyFlaggedToday = billingUpdatedAlready(user?.billingUpdated);
    if (true) {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          billingUpdated: new Date(),
        },
      });

      const scheduledPayments = await prisma.scheduledPayment.findMany({
        where: {
          isPaid: false,
          isLate: false,
          paymentOverview: {
            userId,
          },
        },
      });

      for (const payment of scheduledPayments) {
        const paymentDueDate = new Date(payment.dueDate);
        if (isLate(paymentDueDate)) {
          await prisma.paymentOverview.update({
            where: {
              id: payment.paymentOverviewId,
            },
            data: {
              net: {
                increment: payment.lateFeeWaived
                  ? 0
                  : Number(payment.lateFee || 0),
              },
            },
          });
          await prisma.scheduledPayment.update({
            where: {
              id: payment.id,
            },
            data: {
              isLate: true,
              lateFeeAddedToNet: payment.lateFeeWaived ? false : true,
            },
          });
        }
      }
    }
  }
};
const billingUpdatedAlready = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
