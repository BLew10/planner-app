"use server";
import prisma from "@/lib/prisma/prisma";
const deletePayment = async (paymentId: string) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const deletedPayment = await prisma.payment.delete({
        where: {
          id: paymentId,
        },
      });

      const paymentOverview = await prisma.paymentOverview.findUnique({
        where: {
          lastPaymentId: deletedPayment.id,
        },
      });

      await prisma.paymentOverview.update({
        where: {
          lastPaymentId: paymentId,
        },
        data: {
          amountPaid: Number(paymentOverview?.amountPaid) - Number(deletedPayment.amount),
          lastPaymentId: null,
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
