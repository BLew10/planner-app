"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";


const deletePurchase = async (purchaseId: string, paymentOverviewId: string) => {
  try {
    const session = await auth();

    await prisma.$transaction(async (prisma) => {
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
      await prisma.advertisementPurchaseSlot.deleteMany({
        where: {
          purchaseId,
        }
      })

      await prisma.advertisementPurchase.deleteMany({
        where: {
          purchaseId,
        }
      })
      
      await prisma.purchaseOverview.delete({
        where: {
          id: purchaseId,
        },
      });
    });
    return true; 
  } catch (error: any) {
    console.error("Error deleting purchase", error);
    return false;
  }
};

export default deletePurchase;
