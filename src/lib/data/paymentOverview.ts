"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { PaymentOverviewModel } from "../models/paymentOverview";
import { isLate } from "../helpers";

export const getPaymentOverviewById = async (
  id: string
): Promise<Partial<PaymentOverviewModel> | null> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const payment = await prisma.paymentOverview.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        purchase: true,
        scheduledPayments: true,
        payments: true,
      },
    });
    return payment;
  } catch (e) {
    return null;
  }
};

export const getOwedPayments = async (
  calendarYear: string = "all",
  searchQuery: string = "",
  page: number = 1,
  pageSize: number | null = null
): Promise<{
  data: Partial<PaymentOverviewModel>[] | null;
  totalItems: number;
}> => {
  const session = await auth();
  if (!session) {
    return { data: null, totalItems: 0 };
  }

  const userId = session.user.id;

  // Base query conditions
  const whereConditions: any = {
    userId,
    purchase: {
      isDeleted: false,
    },
  };

  // Add calendarYear filter if not "all"
  if (calendarYear !== "all") {
    whereConditions.purchase.calendarEditionYear = Number(calendarYear);
  }

  // Add search query condition if provided
  if (searchQuery) {
    whereConditions.contact = {
      OR: [
        {
          contactContactInformation: {
            firstName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          contactContactInformation: {
            lastName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          contactContactInformation: {
            company: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
      ],
    };
  }

  // First get the total count for pagination
  const totalItems = await prisma.paymentOverview.count({
    where: whereConditions,
  });

  // Create base query options
  const queryOptions: any = {
    where: whereConditions,
    include: {
      contact: {
        include: {
          contactContactInformation: true,
          contactTelecomInformation: true,
        },
      },
      scheduledPayments: true,
      purchase: {
        include: {
          calendarEditions: true,
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
        purchase: {
          calendarEditionYear: "desc",
        },
      },
    ],
  };

  // Add pagination parameters only if pageSize is provided
  if (pageSize !== null) {
    queryOptions.skip = (page - 1) * pageSize;
    queryOptions.take = pageSize;
  }

  // Then get the data (paginated or all)
  const payments = await prisma.paymentOverview.findMany(queryOptions);

  return {
    data: payments,
    totalItems,
  };
};

export const flagLatePayments = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (user) {
    const alreadyFlaggedToday = billingUpdatedAlready(user?.billingUpdated);
    if (alreadyFlaggedToday) {
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

export const getThisMonthPayments = async (
  calendarYear: string = "all",
  searchQuery: string = "",
  page: number = 1,
  pageSize: number = 10
): Promise<{
  data: Partial<PaymentOverviewModel>[] | null;
  totalItems: number;
}> => {
  const session = await auth();
  if (!session) {
    return { data: null, totalItems: 0 };
  }

  const userId = session.user.id;

  // Get today's date as a proper Date object
  const today = new Date();

  // Base query conditions
  const whereConditions: any = {
    userId,
    purchase: {
      isDeleted: false,
    },
    scheduledPayments: {
      some: {
        isPaid: false,
        // Use the correct field name with capitalized 'T'
        // and pass a proper Date object
        dueDateTimeStamp: {
          lte: today,
        },
      },
    },
  };

  // Add calendarYear filter if not "all"
  if (calendarYear !== "all") {
    whereConditions.purchase.calendarEditionYear = Number(calendarYear);
  }

  // Add search query condition if provided
  if (searchQuery) {
    whereConditions.contact = {
      OR: [
        {
          contactContactInformation: {
            firstName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          contactContactInformation: {
            lastName: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          contactContactInformation: {
            company: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
      ],
    };
  }

  // First get the total count for pagination
  const totalItems = await prisma.paymentOverview.count({
    where: whereConditions,
  });

  // Then get the paginated data
  const payments = await prisma.paymentOverview.findMany({
    where: whereConditions,
    include: {
      contact: {
        include: {
          contactContactInformation: true,
          contactTelecomInformation: true,
        },
      },
      scheduledPayments: {
        where: {
          isPaid: false,
          // Use the correct field name with capitalized 'T'
          dueDateTimeStamp: {
            lte: today,
          },
        },
      },
      purchase: {
        include: {
          calendarEditions: true,
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
        purchase: {
          calendarEditionYear: "desc",
        },
      },
    ],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    data: payments,
    totalItems,
  };
};
