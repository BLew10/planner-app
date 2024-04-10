"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const deleteCalendar = async (calendarId: string) => {
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

    await prisma.$transaction(async (prisma) => {
      const calendar = await prisma.calendarEdition.findFirst({
        where: {
          id: calendarId,
          userId,
        },
        select: {
          id: true,
          purchases: true,
        },
      });
      if (calendar?.purchases && calendar?.purchases.length > 0) {
        await prisma.calendarEdition.update({
          where: {
            id: calendarId,
          },
          data: {
            isDeleted: true,
          },
        });
      } else {
        await prisma.calendarEdition.delete({
          where: {
            id: calendarId,
            userId,
          },
        });
      }
    });

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
