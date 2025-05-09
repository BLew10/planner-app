"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

const deleteAdvertisementType = async (advertisementId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const advertisement = await prisma.advertisement.findFirst({
      where: {
        id: advertisementId,
        userId
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
          userId,
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

    return true
  } catch (error: any) {
    console.error("Error deleting advertisement type", error);
    return false
  }
};

export default deleteAdvertisementType;
