"use server";
import prisma from "@/lib/prisma/prisma";
const deletePaymentOverview = async (paymentOverviewId: string) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.payment.deleteMany({
        where: {
          paymentOverviewId: paymentOverviewId
        }
      })

      await prisma.paymentAllocation.deleteMany({
        where: {
          paymentOverviewId
        }
      })

      await prisma.scheduledPayment.deleteMany({
        where: {
          paymentOverviewId
        }
      })
      await prisma.paymentOverview.delete({
        where: {
          id: paymentOverviewId,
        }
      })
    })
    return true;
  } catch (error: any) {
    console.error("Error deleting payment", error);
    return false;
  }
};

export default deletePaymentOverview;
