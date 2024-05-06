"use server";
import prisma from "@/lib/prisma/prisma";

// TODO: update payment schedules based off deleted payment
const deletePayment = async (paymentId: string) => {
  try {
    console.log("deleting payment", paymentId);
    const result = await prisma.$transaction(async (prisma) => {

      const allocations = await prisma.paymentAllocation.findMany({
        where: {
          paymentId,
        },
      });

      console.log("allocations", allocations);
      for (const allocation of allocations) {
        console.log("allocation", allocation);
        await prisma.scheduledPayment.update({
          where: {
            id: allocation.scheduledPaymentId,
          },
          data: {
            isPaid: false,
            paymentDate: null,
            amountPaid: {
              increment: -Number(allocation.allocatedAmount),
            },
          },
        });

        await prisma.paymentAllocation.delete({
          where: {
            id: allocation.id,
          },
        });
      }
      //find associated allocations to scheduled payments and update them
      const deletedPayment = await prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

      if (!deletedPayment) throw Error("Payment not found");

      const paymentOverview = await prisma.paymentOverview.findUnique({
        where: {
          id: deletedPayment.paymentOverviewId,
        },
      });

      await prisma.paymentOverview.update({
        where: {
          id: deletedPayment.paymentOverviewId,
        },
        data: {
          amountPaid:
            Number(paymentOverview?.amountPaid) - Number(deletedPayment.amount),
          isPaid:
            Number(paymentOverview?.amountPaid) -
              Number(deletedPayment.amount) >=
            Number(paymentOverview?.net),
        },
      });

      await prisma.payment.delete({
        where: {
          id: paymentId,
        },
      });
    });

    return true;
  } catch (error: any) {
    console.error("Error deleting payment", error);
    return false;
  }
};

export default deletePayment;

// const reallocatePayments = async (
//   prismaClient: Omit<
//     PrismaClient<PrismaClientOptions, never, DefaultArgs>,
//     "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
//   >,
//   paymentOverviewId: string
// ): Promise<void> => {
//   const scheduledPayments = await prismaClient.scheduledPayment.findMany({
//     where: { paymentOverviewId },
//     orderBy: { dueDate: "asc" },
//   });

//   let availableFunds = 0;
//   for (const payment of scheduledPayments) {
//     if (payment.isPaid && availableFunds > 0) {
//       // Assuming that the payment can be overpaid or has excess funds that can be reallocated.
//       const excessPayment = Number(payment.amountPaid) - Number(payment.amount);
//       if (excessPayment > 0) {
//         availableFunds += excessPayment;
//         await prismaClient.scheduledPayment.update({
//           where: { id: payment.id },
//           data: { amountPaid: payment.amount, isPaid: true }, // Reset to correct amount
//         });
//       }
//     } else if (!payment.isPaid && availableFunds > 0) {
//       const needed = Number(payment.amount) - Number(payment.amountPaid || 0);
//       const toPay = Math.min(availableFunds, needed);
//       availableFunds -= toPay;
//       await prismaClient.scheduledPayment.update({
//         where: { id: payment.id },
//         data: {
//           amountPaid: { increment: toPay },
//           isPaid: toPay >= needed,
//         },
//       });
//     }
//   }
// };
