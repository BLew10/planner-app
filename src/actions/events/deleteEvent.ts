"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

const deleteCalendarEvent = async (eventId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // Find the event and verify it belongs to a calendar owned by the user
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        calendarEdition: {
          some: {
            userId,
          },
        },
      },
    });

    if (!event) {
      return false;
    }

    // Instead of hard delete, set isDeleted flag
    await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        isDeleted: true,
      },
    });

    return true;
  } catch (error: any) {
    console.error("Error deleting calendar event", error);
    return false;
  }
};

export default deleteCalendarEvent;
