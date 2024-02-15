"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const deleteAdvertisementType = async (formData: FormData) => {
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
    const advertisementId = formData.get("advertisementId")?.toString() || "-1";
    const userId = session.user?.id;

    await prisma.advertisement.delete({
      where: {
        id: advertisementId,
        userId,
      },
    });
  } catch (error: any) {
    // Handle any potential errors here
    console.error("Error deleting advertisement type", error);

    return {
      status: 500,
      json: {
        success: false,
        message: "Error deleting advertisement type",
      },
    };
  }

  revalidatePath("/dashboard/advertisment-types");
};

export default deleteAdvertisementType;
