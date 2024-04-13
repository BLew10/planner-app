"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { cancelStripeSchedule } from "@/lib/helpers/stripeHelpers";
import { PaymentStatusType } from "@/lib/constants";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string || process.env.STRIPE_SECRET_KEY_LIVE as string);

const deletePayment = async (paymentId: string, stripeScheduleId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    console.log("Deleting payment", paymentId);
    await cancelStripeSchedule(stripeScheduleId);
    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: "Cancelled" as PaymentStatusType,
      },
    });

    console.log("Deleted payment", paymentId);
    return true;
  } catch (error: any) {
    console.error("Error deleting purchase", error);
    return false;
  }
};

export default deletePayment;

export const deletePaymentByScheduleId = async (
  stripeSchedule: Stripe.SubscriptionSchedule
) => {
  try {
    await prisma.$transaction(async (prisma) => {
      // Update payment status
      await prisma.payment.updateMany({
        where: {
          stripeScheduleId: stripeSchedule.id,
        },
        data: {
          status: "Cancelled",
        },
      });

      const firstPayment = await prisma.payment.findFirst({
        where: {
          stripeScheduleId: stripeSchedule.id,
        },
      });

      const paymentId = firstPayment?.id || "-1";
      await prisma.purchaseOverview.updateMany({
        where: {
          paymentId,
        },
        data: {
          paymentId: null
        },
      })

      await prisma.paymentInvoice.updateMany({
        where: {
          stripeScheduleId: stripeSchedule.id,
        },
        data: {
          status: "Cancelled",
        }
      });
    });

    return true;
  } catch (error: any) {
    console.error("Error deleting purchase", error);
    return false;
  }
};
