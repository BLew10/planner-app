"use server";

import prisma from "@/lib/prisma/prisma";
import { PaymentModel } from "../models/payment";

export const getPaymentById = async (
  id: string
): Promise<Partial<PaymentModel> | null> => {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id,
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

export const getPaymentsByYear = async (
  year: String
) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        purchase: {
          year: Number(year),
        }
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
}

export const getPaymentsByContactIdAndYear = async (
  contactId: string, 
  year: String
) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        contactId,
        purchase: {
          year: Number(year),
        }
      },
      include: {
        paymentOverview: true,
        purchase: {
          include: {
            calendarEditions: true,
          },
        },
      },  
    });
    return payments;
  } catch (e) {
    console.error('Error getting payments for contact:', e);
    return null;
  }
}