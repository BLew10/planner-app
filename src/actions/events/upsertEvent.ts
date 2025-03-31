"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

export interface EventFormData {
  name: string;
  description?: string;
  date: string;
  isYearly: boolean;
  year?: number | null;
  calendarEditionIds: string[];
}

const upsertEvent = async (
  formData: EventFormData,
  id?: string | null
) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return false;

    // Validate that all selected calendar editions belong to the user
    const userCalendarEditions = await prisma.calendarEdition.findMany({
      where: {
        id: { in: formData.calendarEditionIds },
        userId,
        isDeleted: false,
      },
      select: { id: true },
    });

    // Check if all selected calendar editions belong to the user
    if (userCalendarEditions.length !== formData.calendarEditionIds.length) {
      console.error("Not all calendar editions belong to the user");
      return false;
    }

    // Prepare data for event
    const eventData = {
      name: formData.name,
      description: formData.description || null,
      date: formData.date,
      isYearly: formData.isYearly,
      year: formData.isYearly ? null : formData.year || null,
    };

    await prisma.$transaction(async (tx) => {
      // Create or update the event
      const event = await tx.event.upsert({
        where: {
          id: id || "-1",
        },
        update: eventData,
        create: eventData,
      });

      // If updating, first disconnect all calendar editions
      if (id) {
        await tx.event.update({
          where: { id },
          data: {
            calendarEdition: {
              set: [], // Disconnect all calendar editions
            },
          },
        });
      }

      // Connect the selected calendar editions
      await tx.event.update({
        where: { id: event.id },
        data: {
          calendarEdition: {
            connect: formData.calendarEditionIds.map((calId) => ({
              id: calId,
            })),
          },
        },
      });
    });

    return true;
  } catch (error: any) {
    console.error("Error upserting calendar event", error);
    return false;
  }
};

export default upsertEvent;
