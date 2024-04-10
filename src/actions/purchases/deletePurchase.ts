"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const deletePurchase = async (purchaseId: string) => {
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

  } catch (error: any) {
    console.error("Error deleting purchase", error);

    return {
      status: 500,
      json: {
        success: false,
        message: "Error deleting calendar edition",
      },
    };
  }

  revalidatePath("/dashboard/purchases");
};

export default deletePurchase;
