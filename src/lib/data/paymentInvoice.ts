"use server";

import { PaymentStatusType, InvoiceStatusType} from "../constants";
import prisma from "@/lib/prisma/prisma";
import { PaymentInvoice, Prisma } from "@prisma/client";
import Stripe from "stripe";
import { formatDateToString } from "../helpers/formatDateToString";
import { convertToDollars } from "../helpers/convertToDollars";

export async function handleInvoicePaid(
  stripeInvoice: Stripe.Invoice,
  datePaid: Date
) {
  try {
    const invoice = await prisma.paymentInvoice.update({
      where: { stripeInvoiceId: stripeInvoice.id },
      data: {
        isPaid: true,
        status: "Paid",
        amountOwed: new Prisma.Decimal(convertToDollars(stripeInvoice.total)),
        datePaid: formatDateToString(datePaid),
        invoiceLink: stripeInvoice.invoice_pdf,
      },
      include: { payment: true },
    });

    const totalInvoicesPaid = await prisma.paymentInvoice.count({
      where: { isPaid: true, paymentId: invoice.paymentId },
    });

    const amountPaid = await prisma.paymentInvoice.aggregate({
      where: { isPaid: true, paymentId: invoice.paymentId },
      _sum: { amountOwed: true },
    });

    const payment = await prisma.payment.findFirst({
      where: { id: invoice.paymentId },
    })
    await prisma.payment.update({
      where: { id: invoice.paymentId },
      data: {
        totalPaid: new Prisma.Decimal(amountPaid._sum.amountOwed?.toNumber() || 0),
        paymentsMade: totalInvoicesPaid,
        status: (amountPaid._sum.amountOwed || 0) >= (payment?.totalOwed || 0)
            ? ("Completed" as PaymentStatusType)
            : ("In Progress" as PaymentStatusType),
      },
    });
  } catch (e) {
    console.log("Error updating payment status", e);
    return null;
  }
}


export async function updateInvoiceStatus(
  stripeInvoiceId: string,
  status: InvoiceStatusType
) {
  try {
    const invoice = await prisma.paymentInvoice.update({
      where: { stripeInvoiceId: stripeInvoiceId },
      data: {
        status
      }
    });
    return invoice
  } catch (e) {
    console.log('Error updating invoice status', e)
    return null
  }
}

export async function updateInvoice(
  stripeInvoice: Stripe.Invoice
) {
    let invoiceData: Partial<PaymentInvoice> = {
        amountOwed: new Prisma.Decimal(convertToDollars(stripeInvoice.total)),
        isPaid: stripeInvoice.paid as boolean,
        invoiceLink: stripeInvoice.hosted_invoice_url,
    };

    if (stripeInvoice.due_date) {
        invoiceData = {
            ...invoiceData,
            dateDue: formatDateToString(new Date(stripeInvoice.due_date * 1000)),
        };
    }
  try {
    const invoice = await prisma.paymentInvoice.update({
      where: { stripeInvoiceId: stripeInvoice.id },
      data: {
        ...invoiceData
      }
    });
    return invoice
  } catch (e) {
    console.log('Error updating invoice status', e)
    return null
  }
}

export async function createInvoice(
  stripeInvoice: Stripe.Invoice,
  stripeScheduleId: string
) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripeScheduleId: stripeScheduleId },
    })

    console.log('stripeInvoice?.due_date', stripeInvoice?.due_date)

    let invoice = await prisma.paymentInvoice.findFirst({
      where: { stripeScheduleId: stripeScheduleId },
    })

    if (invoice) {
      return invoice
    }

    invoice = await prisma.paymentInvoice.create({
      data: {
        stripeInvoiceId: stripeInvoice.id,
        stripeScheduleId: stripeScheduleId,
        amountOwed: convertToDollars(stripeInvoice.total),
        isPaid: false,
        invoiceLink: stripeInvoice.invoice_pdf,
        dateDue: stripeInvoice?.due_date ? formatDateToString(new Date(stripeInvoice?.due_date * 1000)) : null,
        dateSent: null,
        datePaid: null,
        status: 'Pending',
        paymentId: payment?.id as string,
      },
    });
    return invoice
  } catch (e) {
    console.log('Error updating invoice status', e)
    return null
  }
}

export async function updateInvoiceSentDate(
  stripeInvoiceId: string
) {
  try {
    const invoice = await prisma.paymentInvoice.update({
      where: { stripeInvoiceId: stripeInvoiceId },
      data: {
        status: 'Sent',
        dateSent: formatDateToString(new Date()),
      }
    });
    return invoice
  } catch (e) {
    console.log('Error updating invoice status', e)
    return null
  }
}

export async function updateInvoiceUrl(stripeInvoice: Stripe.Invoice) {
    try {
        const invoice = await prisma.paymentInvoice.update({
            where: { stripeInvoiceId: stripeInvoice.id },
            data: {
                invoiceLink: stripeInvoice.invoice_pdf
            }
        });
        return invoice
    } catch (e) {
        console.log('Error updating invoice status', e)
        return null
    }
}