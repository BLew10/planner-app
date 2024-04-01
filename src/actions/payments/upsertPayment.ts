"use server";

import Stripe from "stripe";
import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";
import { Payment } from "@prisma/client";
import { redirect } from "next/navigation";

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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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
    let payment: Payment | null = null;
    let {
      paymentId,
      startDate,
      anticipatedEndDate,
      status,
      contactId,
      totalOwed,
      totalPaid,
      totalPayments,
      paymentsMade,
      purchasesIds,
      frequency,
    } = data;
    const result = await prisma.$transaction(
      async (prisma) => {
        const contact = await prisma.contact.findFirst({
          where: { id: data.contactId },
          include: {
            contactTelecomInformation: true,
          },
        });

        if (!contact) {
          return {
            status: 404,
            json: { success: false, message: "Contact not found" },
          };
        }

        if (paymentId) {
          payment = await prisma.payment.findFirst({
            where: { id: paymentId },
          });
        }
        if (payment) {
          // If a paymentId is provided, update the existing payment record
          payment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
              startDate,
              anticipatedEndDate,
              status,
              contactId,
              totalOwed,
              totalPaid,
              totalPayments,
              paymentsMade,
              frequency,
              userId,
              purchases: {
                connect: purchasesIds.map((id) => ({ id })),
              },
            },
          });
        } else {
          // If no paymentId, create a new payment record
          payment = await prisma.payment.create({
            data: {
              startDate,
              frequency,
              userId,
              anticipatedEndDate,
              status,
              contactId,
              totalOwed,
              totalPaid,
              totalPayments,
              paymentsMade,
              purchases: {
                connect: purchasesIds.map((id) => ({ id })),
              },
            },
          });
        }

        if (!payment) {
          throw new Error("Payment not found");
        }
        const stripeCustomerId = await findOrCreateStripeCustomer(
          contact.contactTelecomInformation?.email || ""
        );
        // Calculate the invoice amounts and generate dates based on the frequency and total payments
        const invoiceDates = generateInvoiceDates(
          data.startDate,
          data.frequency,
          data.totalPayments
        );
        const amountPerInvoice = Math.round(
          (data.totalOwed * 100) / data.totalPayments
        ); // in cents

        // Create the invoices in Stripe
        if (!payment) {
          throw new Error("Payment not found");
        }
        for (const invoiceDate of invoiceDates) {
          const { invoiceItem, invoice } = await createStripeInvoice(
            stripeCustomerId,
            invoiceDate,
            amountPerInvoice
          );

          const stripeInvoice = await prisma.stripeInvoice.create({
            data: {
              customerEmail: invoice.customer_email || "",
              stripeInvoiceId: invoiceItem.id,
              paymentId: payment.id,
              paid: false,
              updatedAt: new Date(),
              cost: amountPerInvoice,
              dueDate: invoiceDate,
            },
          });
        }
        console.log("Payment upserted successfully");
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

async function findOrCreateStripeCustomer(email: string) {
  // Attempt to find the customer by email
  const customers = await stripe.customers.list({ email: email, limit: 1 });
  if (customers.data.length > 0) {
    return customers.data[0].id; // Return existing Stripe customer ID
  } else {
    // Create a new Stripe customer with this email
    const newCustomer = await stripe.customers.create({ email: email });
    return newCustomer.id; // Return new Stripe customer ID
  }
}

function generateInvoiceDates(
  startDate: Date,
  frequency: string,
  totalPayments: number
): Date[] {
  let dates = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < totalPayments; i++) {
    switch (frequency) {
      case "Weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case "Monthly":
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case "Annually":
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
    dates.push(new Date(currentDate));
  }

  return dates;
}

async function createStripeInvoice(
  stripeCustomerId: string,
  dueDate: Date,
  amount: number
) {

  const invoice = await stripe.invoices.create({
    customer: stripeCustomerId,
    auto_advance: true,
    collection_method: "send_invoice",
    due_date: Math.floor(dueDate.getTime() / 1000),
  });

  const invoiceItem = await stripe.invoiceItems.create({
    customer: stripeCustomerId,
    amount: amount,
    currency: "usd",
    description: "Scheduled payment",
    invoice: invoice.id,
  });

  return { invoice, invoiceItem };
}
