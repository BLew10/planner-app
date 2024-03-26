"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";
import { redirect } from "next/navigation";

export interface UpsertPaymentData {
  paymentId?: string | null;
  startDate: Date;
  anticipatedEndDate: Date;
  frequency: string;
  purchasesIds: string[]
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
  if (!session) {
    return {
      status: 401,
      json: {
        success: false,
        message: "Not authenticated",
      },
    };
  }

  console.log('Creating payment');
  const userId = session.user?.id;
  const { paymentId,startDate, anticipatedEndDate, status, contactId, totalOwed, totalPaid, totalPayments, paymentsMade, purchasesIds, frequency} = data;
  const result  = await prisma.$transaction(async (prisma) => {
    if (paymentId) {
      // If a paymentId is provided, update the existing payment record
       await prisma.payment.update({
        where: { id: paymentId },
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
          }
        }
      });
    } else {
      // If no paymentId, create a new payment record
       await prisma.payment.create({
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
          }
        }
      });
    }
    console.log('Payment upserted successfully');
  })
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
