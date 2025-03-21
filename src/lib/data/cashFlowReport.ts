"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { serializeReturn } from "../helpers";

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

export const getCashFlowData = async (year: string, company: string = "All") => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const data = await prisma.purchaseOverview.findMany({
      where: {
        userId,
        paymentOverview: {
          scheduledPayments: {
            some: {
              year: Number(year)
            }
          }
        },
        ...(company !== "All" && {
          contact: {
            contactContactInformation: {
              company: {
                contains: company,
                mode: "insensitive",
              },
            },
          },
        }),
      },
      include: {
        payments: {
          where: {
            paymentOverview: {
              scheduledPayments: {
                some: {
                  year: Number(year)
                }
              }
            }
          }
        },
        contact: {
          include: {
            contactContactInformation: true,
          },
        },
        paymentOverview: {
          include: {
            scheduledPayments: {
              where: {
                year: Number(year)
              },
              orderBy: {
                month: "asc",
              },
            },
          },
        },
      },
    });

    // Transform the data for the cash flow report
    const transformedData = data.map((purchase) => {
      const monthlyData = purchase.paymentOverview?.scheduledPayments.reduce(
        (acc, payment) => {
          const monthIndex = payment.month - 1;
          const monthName = MONTHS[monthIndex];
          return {
            ...acc,
            [monthName]: {
              projected: Number(payment.amount),
              actual: Number(payment.amountPaid),
            },
          };
        },
        {}
      );

      return {
        name:
          purchase.contact?.contactContactInformation?.company ||
          `${purchase.contact?.contactContactInformation?.firstName} ${purchase.contact?.contactContactInformation?.lastName}`,
        isInactive: purchase.contact?.isDeleted,
        months: monthlyData || {},
        yearTotal: {
          projected: Number(purchase.amountOwed) || 0,
          actual: purchase.payments.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0
          ),
        },
      };
    });

    return serializeReturn(transformedData);
  } catch (error) {
    console.error("Error in getCashFlowData:", error);
    throw error;
  }
};
