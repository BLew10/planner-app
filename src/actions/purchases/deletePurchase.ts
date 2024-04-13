"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const deletePurchase = async (purchaseId: string) => {
  try {
    const session = await auth();

    await prisma.$transaction(async (prisma) => {

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
