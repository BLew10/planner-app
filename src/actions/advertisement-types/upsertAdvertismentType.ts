"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

export interface AdvertisementTypeFormData {
  name: string ;
  isDayType: boolean;
  perMonth: number;
}

const upsertAdvertisementType = async (formData: AdvertisementTypeFormData, id?: string | null) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return false
    
    const data = {
      ...formData,
      userId,
    }

    if (!data) return false

    const advertisement = await prisma.advertisement.upsert({
      where: {
        id: id || "-1",
        userId
      },
      update: data,
      create: data,
    });

    return true;
  } catch (error: any) {
    console.error("Error upserting advertisement type", error);

    return false;
  }

};

export default upsertAdvertisementType;
