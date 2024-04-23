"use server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import {
  PrismaClientOptions,
  DefaultArgs,
} from "@prisma/client/runtime/library";
import prisma from "@/lib/prisma/prisma";
import { Payment } from "@prisma/client";
import { formatDateToString } from "@/lib/helpers/formatDateToString";

export interface UpsertPaymentData {
  paymentId?: string | null;
  startDate: Date;
  anticipatedEndDate: Date;
  frequency: string;
  purchasesIds: string[];
  totalOwed: number;
  totalPaid: number;
  status: string;
  contactId: string;
  totalPayments: number;
  paymentsMade: number;
}
export async function upsertPayment(data: UpsertPaymentData) {
  try {
    const session = await auth();
    if (!session) return false
    const userId = session.user?.id;
    const { frequency } = data;
    const result = await prisma.$transaction(async (prismaClient) => {
      const contact = await prismaClient.contact.findFirst({
        where: { id: data.contactId },
        include: {
          contactTelecomInformation: true,
          contactContactInformation: true, 
        },
      });
      if (!contact || !contact.contactTelecomInformation?.email) return false

      const payment = await createPrismaPayment(data, prismaClient, userId);
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 20000, // default: 5000
      }
    );
    return true
  } catch (error: any) {
    console.error("Error upserting purchase", error);
    return false;
  }

}

async function createPrismaPayment(
  paymentData: UpsertPaymentData,
  prisma: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  userId: string
) {
  const payment: Payment = await prisma.payment.create({
    data: {
      startDate: formatDateToString(paymentData.startDate),
      frequency: paymentData.frequency,
      userId,
      anticipatedEndDate: formatDateToString(paymentData.anticipatedEndDate),
      status: paymentData.status,
      contactId: paymentData.contactId,
      totalOwed: paymentData.totalOwed,
      totalPaid: paymentData.totalPaid,
      totalPayments: paymentData.totalPayments,
      paymentsMade: paymentData.paymentsMade,
      purchases: {
        connect: paymentData.purchasesIds.map((id) => ({ id })),
      },
    },
  });
  return payment;
}

async function updatePrismaPayment(
  paymentId: string,
  paymentData: UpsertPaymentData,
  prisma: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  userId: string
) {
  const payment: Payment = await prisma.payment.update({
    where: { id: paymentId, userId },
    data: {
      startDate: formatDateToString(paymentData.startDate),
      frequency: paymentData.frequency,
      anticipatedEndDate: formatDateToString(paymentData.anticipatedEndDate),
      status: paymentData.status,
      contactId: paymentData.contactId,
      totalOwed: paymentData.totalOwed,
      totalPaid: paymentData.totalPaid,
      totalPayments: paymentData.totalPayments,
      paymentsMade: paymentData.paymentsMade,
      purchases: {
        connect: paymentData.purchasesIds.map((id) => ({ id })),
      },
    },
  });
  return payment;
}
