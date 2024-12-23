"use server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import {
  PrismaClientOptions,
  DefaultArgs,
} from "@prisma/client/runtime/library";
import prisma from "@/lib/prisma/prisma";
import { Payment } from "@prisma/client";
import { redirect } from "next/navigation";
import {
  findOrCreateStripeCustomer,
  createStripeSubscriptionSchedule,
  createStripePrice,
} from "@/lib/helpers/stripeHelpers";
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
      const stripeCustomer = await findOrCreateStripeCustomer(contact.stripeCustomerId || "", contact.contactTelecomInformation?.email || "");
      if (!stripeCustomer) return false
      if (contact?.stripeCustomerId != stripeCustomer.id)
      await prismaClient.contact.update({
        where: { id: contact.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });

      const payment = await createPrismaPayment(data, prismaClient, userId);
      const paymentPerPeriodInCents = Math.ceil((data.totalOwed / data.totalPayments) * 100);
      const price = await createStripePrice(paymentPerPeriodInCents, frequency, contact.contactContactInformation?.company || "");
      if (!price) return false
      const schedule = await createStripeSubscriptionSchedule(stripeCustomer.id, price.id, data.startDate.toISOString().split("T")[0], data.totalPayments);
      if (!schedule) return false
      await addStripeScheduleIdToPayment(payment.id, schedule.id, prismaClient, userId, schedule.subscription as string);
      console.log("Subscription Schedule created:", schedule.id);
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

async function addStripeScheduleIdToPayment(
  paymentId: string,
  stripeScheduleId: string,
  prisma: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  userId: string, 
  stripeSubscriptionId: string | null
) {
  const payment: Payment = await prisma.payment.update({
    where: { id: paymentId, userId },
    data: {
      stripeScheduleId,
      stripeSubscriptionId
    },
  });
  return payment;
}
