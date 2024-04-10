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
// TODO: Send invoices automatically with cron job or webhook
// await stripe.invoices.sendInvoice(invoiceId);
export async function upsertPayment(data: UpsertPaymentData) {
  try {
    const session = await auth();
    if (!session) {
      return {
        status: 401,
        json: {
          success: false,
          message: "Not authenticated",
        },
      };
    }

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
      if (!contact) {
        return {
          status: 404,
          json: { success: false, message: "Contact not found" },
        };
      }
      const stripeCustomer = await findOrCreateStripeCustomer(contact.contactTelecomInformation?.email || "");
      if (!stripeCustomer) {
        return {
          status: 404,
          json: { success: false, message: "Stripe customer not found" },
        };
      }

      const payment = await createPrismaPayment(data, prismaClient, userId);
      const paymentPerPeriodInCents = Math.ceil((data.totalOwed / data.totalPayments) * 100);
      const price = await createStripePrice(paymentPerPeriodInCents, frequency, contact.contactContactInformation?.company || "");
      if (!price) {
        return {
          status: 404,
          json: { success: false, message: "Price not found" },
        };
      }
      const schedule = await createStripeSubscriptionSchedule(stripeCustomer.id, price.id, data.startDate.toISOString().split("T")[0], data.totalPayments);
      if (!schedule) {
        return {
          status: 404,
          json: { success: false, message: "Schedule not found" },
        };
      }
      await addStripeScheduleIdToPayment(payment.id, schedule.id, prismaClient, userId);
      console.log("Subscription Schedule created:", schedule.id);
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 20000, // default: 5000
      }
    );
  } catch (error: any) {
    console.error("Error upserting purchase", error);
    return {
      status: 500,
      json: {
        success: false,
        message: "Error upserting purchase",
      },
    };
  }

  redirect("/dashboard/payments");
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
      startDate: paymentData.startDate,
      frequency: paymentData.frequency,
      userId,
      anticipatedEndDate: paymentData.anticipatedEndDate,
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
      startDate: paymentData.startDate,
      frequency: paymentData.frequency,
      anticipatedEndDate: paymentData.anticipatedEndDate,
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
  userId: string
) {
  const payment: Payment = await prisma.payment.update({
    where: { id: paymentId, userId },
    data: {
      stripeScheduleId,
    },
  });
  return payment;
}
