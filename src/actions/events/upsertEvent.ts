"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import {
  EventMonthSelector,
  EventOrdinal,
  EventScheduleType,
  EventWeekday,
  getMonthDay,
} from "@/lib/events/recurrence";

export interface EventFormData {
  name: string;
  description?: string;
  date: string;
  isYearly: boolean;
  year?: number | null;
  calendarEditionIds: string[];
  isMultiDay: boolean;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  scheduleType?: EventScheduleType;
  startsOn?: string;
  endsOn?: string;
  monthlyOrdinal?: EventOrdinal;
  monthlyWeekday?: EventWeekday;
  monthlyMonthSelector?: EventMonthSelector;
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

    const scheduleType =
      formData.scheduleType ??
      (formData.isMultiDay ? "DAILY_RANGE" : "SINGLE_DAY");
    const startsOn = formData.startsOn || formData.date;
    const endsOn =
      formData.endsOn ||
      (scheduleType === "DAILY_RANGE" ? formData.endDate : undefined);
    const legacyDate = getMonthDay(startsOn);
    const legacyEndDate = endsOn ? getMonthDay(endsOn) : null;
    const eventYear =
      !formData.isYearly && startsOn?.length >= 4
        ? parseInt(startsOn.slice(0, 4), 10)
        : formData.year || null;

    // Prepare data for event
    const eventData = {
      name: formData.name,
      description: formData.description || null,
      date: legacyDate,
      isYearly: formData.isYearly,
      year: formData.isYearly ? null : eventYear,
      isMultiDay: scheduleType === "DAILY_RANGE",
      endDate: legacyEndDate,
      startTime: formData.startTime || null,
      endTime: formData.endTime || null,
      scheduleType,
      startsOn: startsOn || null,
      endsOn: endsOn || null,
      monthlyOrdinal:
        scheduleType === "MONTHLY_DAY" ||
        scheduleType === "MONTHLY_ORDINAL_WEEKDAY"
          ? formData.monthlyOrdinal || "FIRST"
          : null,
      monthlyWeekday:
        scheduleType === "MONTHLY_ORDINAL_WEEKDAY"
          ? formData.monthlyWeekday || null
          : null,
      monthlyMonthSelector:
        scheduleType === "MONTHLY_ORDINAL_WEEKDAY"
          ? formData.monthlyMonthSelector || "EVERY"
          : null,
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
