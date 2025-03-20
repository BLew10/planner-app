"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

export interface CalendarEditionFormData {
  name: string;
  code: string;
}

const upsertCalendarEdition = async (
  formData: CalendarEditionFormData,
  id?: string | null
) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const data = {
      ...formData,
      userId,
    };

    if (!data || !userId) return false;

    await prisma.calendarEdition.upsert({
      where: {
        id: id || "-1",
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

export default upsertCalendarEdition;
