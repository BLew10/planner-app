"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const deleteAdvertisementType = async (advertisementId: string) => {
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
    
    const userId = session.user?.id;
    const advertisement = await prisma.advertisement.findFirst({
      where: {
        id: advertisementId,
        userId,
      },
      select: {
        id: true,
        purchases: true,
      },
    });

    // Check if purchases exist for the advertisement and if so soft delete the advertisement
    if (advertisement?.purchases && advertisement?.purchases.length > 0) {
      await prisma.advertisement.update({
        where: {
          id: advertisementId,
        },
        data: {
          isDeleted: true,
        },
      });
    } else {
      await prisma.advertisement.delete({
        where: {
          id: advertisementId,
          userId,
        },
      });
    }
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
