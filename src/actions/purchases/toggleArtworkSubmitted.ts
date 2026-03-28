"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

const toggleArtworkSubmitted = async (
  purchaseId: string,
  hasSubmittedArtwork: boolean
) => {
  try {
    const session = await auth();
    if (!session) {
      return false;
    }

    await prisma.purchaseOverview.update({
      where: {
        id: purchaseId,
      },
      data: {
        hasSubmittedArtwork,
      },
    });

    return true;
  } catch (error: any) {
    console.error("Error toggling artwork submitted status", error);
    return false;
  }
};

export default toggleArtworkSubmitted;
