"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { ScheduledPayment, PaymentOverview } from "@/store/paymentStore";

export interface UpsertPaymentData {
  id?: string; // Optional, if provided, it will try to update an existing payment
  userId?: string;
  contactId?: string;
  totalSale: number;
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
}

export async function upsertPayment(data: PaymentOverview) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) return false;

    const {
      id,
      contactId,
      totalSale,
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
    } = data;
    let payment;
    const result = await prisma.$transaction(async (prisma) => {
    if (id) {
      await prisma.scheduledPayment.deleteMany({ where: { paymentId: id } });
      payment =  await prisma.paymentOverview.update({
        where: { id },
        data: {
          totalSale,
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
        },
      });
    } else {
      // Create new payment
     payment = await prisma.paymentOverview.create({
        data: {
          userId: session.user.id,
          contactId,
          totalSale,
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
        },
      });
    }

    for (const scheduledPayment of scheduledPayments) {
      const { dueDate, month, year, amount, isPaid } = scheduledPayment;
      await prisma.scheduledPayment.create({
        data: {
          paymentId: payment.id,
          dueDate: formatDateToString(dueDate),
          month: month,
          year: year,
          amount: amount || 0,
          isPaid: isPaid,
        },
      });
    }
    await prisma.purchaseOverview.update({
      where: { id: data.purchaseId},
      data: {
        paymentId: payment.id,
      }
    })
  });


    return true;
  } catch (error) {
    console.error("Error upserting payment", error);
    return false;
  }
}
