"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const deletePurchase = async (formData: FormData) => {
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
    const paymentId = formData.get("paymentId")?.toString() || "-1";
    await prisma.payment.delete({
      where: {
        id: paymentId,
      },
    })


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

  revalidatePath("/dashboard/payments");
};

export default deletePurchase;
