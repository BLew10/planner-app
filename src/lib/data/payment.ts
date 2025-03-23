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
  calendarEditionYear: string
) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    await flagLatePayments(userId);
    const payments = await prisma.payment.findMany({
      where: {
        userId,
        purchase: {
          calendarEditionYear: Number(calendarEditionYear),
        },
      },
      include: {
        contact: {
          include: {
            contactContactInformation: true,
          },
        },
      },
    });
    return payments;
  } catch (e) {
    return null;
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
