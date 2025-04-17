"use server";

import prisma from "@/lib/prisma/prisma";
import { PaymentModel } from "../models/payment";
import { flagLatePayments } from "./paymentOverview";
import { auth } from "@/auth";

export const getPaymentById = async (
  id: string
): Promise<Partial<PaymentModel> | null> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        purchase: true,
        contact: true,
        paymentOverview: true,
      },
    });
    return payment;
  } catch (e) {
    return null;
  }
};

export const getPaymentsByCalendarEditionYear = async (
  calendarEditionYear: string,
  page: number = 1,
  itemsPerPage: number = 10,
  searchQuery: string = ""
): Promise<{ payments: Partial<PaymentModel>[]; total: number }> => {
  const session = await auth();
  if (!session) {
    return { payments: [], total: 0 };
  }

  const userId = session.user.id;
  const year = Number(calendarEditionYear);

  try {
    const where = {
      userId,
      purchase: {
        calendarEditionYear: year,
      },
      OR: [
        {
          contact: {
            contactContactInformation: {
              company: { contains: searchQuery, mode: "insensitive" as const },
            },
          },
        },
        {
          contact: {
            contactContactInformation: {
              firstName: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
          },
        },
        {
          contact: {
            contactContactInformation: {
              lastName: { contains: searchQuery, mode: "insensitive" as const },
            },
          },
        },
        {
          checkNumber: { contains: searchQuery, mode: "insensitive" as const },
        },
        {
          paymentMethod: {
            contains: searchQuery,
            mode: "insensitive" as const,
          },
        },
      ],
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          contact: {
            include: {
              contactContactInformation: true,
              contactTelecomInformation: true,
            },
          },
          purchase: true,
        },
        orderBy: {
          paymentDate: "desc",
        },
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { payments: [], total: 0 };
  }
};

export const getPaymentsByContactId = async (
  contactId: string,
  calendarEditionYear?: string
): Promise<Partial<PaymentModel>[] | null> => {
  const session = await auth();
  if (!session) {
    return null;
  }

  const userId = session.user.id;

  try {
    const where = {
      userId,
      contactId,
      purchase: {
        isDeleted: false,
        ...(calendarEditionYear && calendarEditionYear !== "all"
          ? { calendarEditionYear: Number(calendarEditionYear) }
          : {}),
      },
    };

    const payments = await prisma.payment.findMany({
      where,
      include: {
        paymentOverview: true,
        purchase: {
          include: {
            calendarEditions: true,
          },
        },
      },
      orderBy: [
        {
          paymentOverview: {
            calendarEditionYear: "desc",
          },
        },
        {
          paymentDate: "desc",
        },
      ],
    });

    return payments;
  } catch (e) {
    console.error("Error getting payments for contact:", e);
    return null;
  }
};
