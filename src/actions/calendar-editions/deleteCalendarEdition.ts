"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const deleteCalendar = async (formData: FormData) => {
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
    const calendarId = formData.get("calendarId")?.toString() || "-1";
    console.log("Deleting calendar edition", calendarId);
    const userId = session.user?.id;

    await prisma.$transaction(async (prisma) => {
      // First, delete all associated months
      await prisma.month.deleteMany({
        where: {
          editionId: calendarId,
        },
      });
  
      // Then, delete the calendar edition
      await prisma.calendarEdition.delete({
        where: {
          id: calendarId,
        },
      });
    });
    console.log("Deleted calendar edition", calendarId);

  } catch (error: any) {
    // Handle any potential errors here
    console.error("Error deleting calendar edition", error);

    return {
      status: 500,
      json: {
        success: false,
        message: "Error deleting calendar edition",
      },
    };
  }

  revalidatePath("/dashboard/calendar-editions");
};

export default deleteCalendar;
