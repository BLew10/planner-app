"use server";

import { auth } from "@/auth";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import {
  ScheduledPayment,
  PaymentOverview,
} from "@/store/paymentOverviewStore";
import { PrismaClient } from "@prisma/client";
import {
  PrismaClientOptions,
  DefaultArgs,
} from "@prisma/client/runtime/library";

export interface UpsertPaymentData {
  id?: string; // Optional, if provided, it will try to update an existing payment
  userId?: string;
  contactId: string;
  totalSale: number;
  net: number;
  additionalDiscount1?: number;
  additionalDiscount2?: number;
  additionalSales1?: number;
  additionalSales2?: number;
  trade?: number;
  earlyPaymentDiscount?: number;
  earlyPaymentDiscountPercent?: number;
  amountPrepaid?: number;
  paymentMethod?: string;
  checkNumber?: string;
  paymentDueOn?: number;
  paymentOnLastDay: boolean;
  lateFee?: number;
  lateFeePercent?: number;
  deliveryMethod?: string;
  cardType?: string;
  cardNumber?: string;
  cardExpirationDate?: Date;
  invoiceMessage?: string;
  statementMessage?: string;
  scheduledPayments: ScheduledPayment[];
  splitPaymentsEqually?: boolean;
}

export async function upsertPaymentOverview(
  prisma: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  data: PaymentOverview,
  year: string,
  contactId: string,
  purchaseOverviewId: string
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) return false;
    const {
      id,
      totalSale,
      net,
      additionalDiscount1,
      additionalDiscount2,
      additionalSales1,
      additionalSales2,
      trade,
      earlyPaymentDiscount,
      earlyPaymentDiscountPercent,
      amountPrepaid,
      paymentMethod,
      checkNumber,
      paymentDueOn,
      paymentOnLastDay,
      lateFee,
      lateFeePercent,
      deliveryMethod,
      cardType,
      cardNumber,
      cardExpirationDate,
      invoiceMessage,
      statementMessage,
      scheduledPayments,
      splitPaymentsEqually,
    } = data;

    let lateFeeFinal = null;

    if (lateFee) {
      lateFeeFinal = lateFee;
    } else if (lateFeePercent) {
      lateFeeFinal = totalSale * (lateFeePercent / 100);
    }

    let paymentOverview;
    if (id) {
      await prisma.scheduledPayment.deleteMany({
        where: { paymentOverviewId: id },
      });
      paymentOverview = await prisma.paymentOverview.update({
        where: { id },
        data: {
          totalSale,
          net,
          purchaseId: purchaseOverviewId,
          additionalDiscount1,
          additionalDiscount2,
          additionalSales1,
          additionalSales2,
          trade,
          earlyPaymentDiscount,
          earlyPaymentDiscountPercent,
          prepaid: amountPrepaid ? true : false,
          paymentDueOn,
          paymentOnLastDay,
          lateFee,
          lateFeePercent,
          deliveryMethod,
          cardType,
          cardNumber,
          cardExpirationDate,
          invoiceMessage,
          statementMessage,
          splitPaymentsEqually,
        },
      });
    } else {
      // Create new payment
      const invoiceNumber = await generateInvoiceNumber(prisma, year);
      paymentOverview = await prisma.paymentOverview.create({
        data: {
          userId: session.user.id,
          invoiceNumber,
          contactId,
          year: Number(year),
          totalSale,
          net: net || 0,
          additionalDiscount1,
          additionalDiscount2,
          additionalSales1,
          additionalSales2,
          trade,
          earlyPaymentDiscount,
          earlyPaymentDiscountPercent,
          prepaid: amountPrepaid ? true : false,
          paymentDueOn,
          purchaseId: purchaseOverviewId,
          paymentOnLastDay,
          lateFee,
          lateFeePercent,
          deliveryMethod,
          cardType,
          cardNumber,
          cardExpirationDate,
          invoiceMessage,
          statementMessage,
          splitPaymentsEqually,
        },
      });
    }

    if (amountPrepaid) {
      let firstPayment = await prisma.payment.findFirst({
        where: {
          paymentOverviewId: paymentOverview.id,
          wasPrepaid: true,
        },
      });
      if (firstPayment) {
        await prisma.payment.update({
          where: {
            id: firstPayment.id,
          },
          data: {
            amount: amountPrepaid,
            checkNumber,
            paymentMethod,
          },
        });
      } else {
        await prisma.payment.create({
          data: {
            paymentOverviewId: paymentOverview.id,
            contactId: contactId as string,
            amount: amountPrepaid,
            checkNumber,
            paymentMethod,
            purchaseId: purchaseOverviewId,
            wasPrepaid: true,
            paymentDate: formatDateToString(new Date()),
          },
        });
      }
    } else {
      await prisma.payment.deleteMany({
        where: {
          paymentOverviewId: paymentOverview.id,
          wasPrepaid: true,
        },
      })
    }
    for (const scheduledPayment of scheduledPayments) {
      const { dueDate, month, year, amount } = scheduledPayment;
      await prisma.scheduledPayment.create({
        data: {
          paymentOverviewId: paymentOverview.id,
          dueDate: formatDateToString(dueDate),
          month: month,
          year: year,
          amount: amount || 0,
          lateFee: lateFeeFinal
        },
      });
    }
    return paymentOverview.id;
  } catch (error) {
    console.error("Error upserting payment overview", error);
    throw error;
  }
}

const generateInvoiceNumber = async (prisma: any, year: string) => {
  const lastTwoDigits = year.slice(-2);
  let count =
    (await prisma.paymentOverview.count({
      where: {
        year: Number(year),
      },
    })) + 1;

  while (true) {
    let countToString = count.toString().padStart(4, "0");
    let invoiceNumber = `${lastTwoDigits}${countToString}`;

    // Check if the generated invoice number already exists
    const exists = await prisma.paymentOverview.findUnique({
      where: {
        invoiceNumber: invoiceNumber,
      },
    });

    if (!exists) {
      return invoiceNumber; // If the invoice number does not exist, return it
    }

    count++; // Otherwise, increment the count and try again
  }
};
