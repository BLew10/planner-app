"use server";

import { auth } from "@/auth";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma/prisma";

export interface UpsertPaymentData {
  id?: string; // Optional, if provided, it will try to update an existing payment
  amount: number;
  paymentMethod: string;
  checkNumber: string;
  paymentDate: string;
  contactId: string;
  purchaseId: string;
  paymentOverviewId: string;
}

export async function upsertPayment(data: UpsertPaymentData) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) return false;

    const {
      id,
      amount,
      paymentMethod,
      checkNumber,
      paymentDate,
      contactId,
      purchaseId,
      paymentOverviewId,
    } = data;

    let upsertedPayment;
    const result = await prisma.$transaction(async (prismaClient) => {
      const paymentOverview = await prismaClient.paymentOverview.findFirst({
        where: {
          id: paymentOverviewId,
        },
      });

      if (id) {
        const oldPaymentData = await prismaClient.payment.findUnique({
          where: { id },
        });

        if (!oldPaymentData) {
          throw new Error("Payment not found");
        }

        upsertedPayment = await prismaClient.payment.update({
          where: { id },
          data: {
            amount,
            paymentMethod,
            checkNumber,
            paymentDate: paymentDate,
          },
        });


        await clearAllocations(prismaClient, oldPaymentData.id, paymentDate);
        const newAmountPaid = Number(paymentOverview?.amountPaid || 0) - Number(oldPaymentData.amount) + Number(upsertedPayment.amount);
        await prismaClient.paymentOverview.update({
          where: { id: paymentOverviewId },
          data: {
            lastPaymentId: upsertedPayment.id,
            amountPaid: newAmountPaid,
            isPaid: newAmountPaid >= Number(paymentOverview?.net || 0)
          },
        });
      } else {
        // Create new payment
        upsertedPayment = await prismaClient.payment.create({
          data: {
            contactId,
            amount,
            paymentMethod,
            checkNumber,
            paymentDate: paymentDate,
            purchaseId,
            paymentOverviewId,
          },
        });

        const amountPaid = Number(paymentOverview?.amountPaid || 0) + Number(upsertedPayment.amount);
        await prismaClient.paymentOverview.update({
          where: { id: paymentOverviewId },
          data: {
            lastPaymentId: upsertedPayment.id,
            amountPaid: amountPaid,
            isPaid: amountPaid >= Number(paymentOverview?.net || 0)
          },
        });
      }

      await createAllocatePayments(
        prismaClient,
        upsertedPayment.id,
        paymentOverviewId,
        amount,
        paymentDate
      );
    });

    return true;
  } catch (error) {
    console.error("Error upserting payment overview", error);
    return false;
  }
}

async function createAllocatePayments(
  prisma: any,
  paymentId: string,
  paymentOverviewId: string,
  amount: number,
  paymentDate: string
) {
  const scheduledPayments = await prisma.scheduledPayment.findMany({
    where: {
      paymentOverviewId,
      isPaid: false, // Focus on unpaid scheduled payments
      paymentDate: null, // Ensure these payments haven't been fully covered yet
    },
    orderBy: {
      dueDate: "asc", // Prioritize earlier due dates
    },
  });

  let remainingAmount = amount;

  for (const scheduled of scheduledPayments) {
    if (remainingAmount <= 0) break;
    const scheduledAmount = Number(scheduled.amount);
    const amountAlreadyPaid = Number(scheduled.amountPaid);
    const amountToAllocate = Math.min(
      remainingAmount,
      scheduledAmount - amountAlreadyPaid
    );

    const allocation = await prisma.paymentAllocation.create({
      data: {
        paymentId,
        paymentOverviewId,
        scheduledPaymentId: scheduled.id,
        allocatedAmount: amountToAllocate,
      },
    });

    // Update the scheduled payment's paid amount
    await prisma.scheduledPayment.update({
      where: { id: scheduled.id },
      data: {
        amountPaid: {
          increment: new Prisma.Decimal(amountToAllocate),
        },
        isPaid: amountAlreadyPaid + amountToAllocate >= scheduledAmount,
        paymentDate:
          amountAlreadyPaid + amountToAllocate >= scheduledAmount
            ? paymentDate
            : null,
      },
    });

    remainingAmount -= amountToAllocate;
  }
}

async function clearAllocations(prisma: any, paymentId: string, paymentDate: string) {
  const allocatedPayments = await prisma.paymentAllocation.findMany({
    where: {
      paymentId,
    },
  });

  // loop through and remove amount from scheduled payments
  // then create new allocations with new amount
  for (const paymentAllocation of allocatedPayments) {
    const scheduledPayment = await prisma.scheduledPayment.findUnique({
      where: {
        id: paymentAllocation.scheduledPaymentId,
      },
    })
    let newAmountPaid = Number(scheduledPayment?.amountPaid || 0) - paymentAllocation.allocatedAmount;
    let isPaidInFull = newAmountPaid >= Number(scheduledPayment?.amount || 0);
    const updateScheduledPayment = await prisma.scheduledPayment.update({
      where: {
        id: paymentAllocation.scheduledPaymentId,
      },
      data: {
        amountPaid: newAmountPaid,
        isPaid: isPaidInFull,
        paymentDate: isPaidInFull ? paymentDate : null,
      },
    });
  }

  // delete payment allocations
  await prisma.paymentAllocation.deleteMany({
    where: {
      paymentId,
    },
  });
}
