"use server";

import prisma from "@/lib/prisma/prisma";
import { Event, CalendarEdition, Prisma } from "@prisma/client";
import { auth } from "@/auth";


export const getEventById = async (
  id: string
): Promise<
  | (Partial<Event> & { calendarEditions?: Partial<CalendarEdition>[] })
  | null
> => {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const event = await prisma.event.findFirst({
      where: {
        id,
        isDeleted: false,
        calendarEdition: {
          some: {
            userId,
            isDeleted: false,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        isYearly: true,
        year: true,
        isMultiDay: true,
        endDate: true,
        startTime: true,
        endTime: true,
        calendarEdition: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!event) return null;

    return {
      ...event,
      calendarEditions: event.calendarEdition,
    };
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    return null;
  }
};


export const getAllEvents = async (
  calendarEditionId: string | null = null,
  page: number | null = null,
  pageSize: number | null = null,
  search: string | null = null
): Promise<{
  data: (Partial<Event> & { calendarEditionCodes?: string })[] | null;
  totalItems: number;
}> => {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const skip = page && pageSize ? (page - 1) * pageSize : undefined;
    const where = {
      isDeleted: false,
      calendarEdition: {
        some: {
          ...(calendarEditionId && { id: calendarEditionId }),
          userId,
          isDeleted: false,
        },
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          date: true,
          isYearly: true,
          year: true,
          isMultiDay: true,
          endDate: true,
          startTime: true,
          endTime: true,
          _count: {
            select: {
              calendarEdition: true,
            },
          },
          calendarEdition: {
            select: {
              code: true,
            },
          },
        },
        ...(skip !== undefined && { skip }),
        ...(pageSize && { take: pageSize }),
        orderBy: [{ isYearly: "desc" }, { date: "asc" }],
      }),
      prisma.event.count({ where }),
    ]);



    return {
      data: events,
      totalItems: total,
    };
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return {
      data: null,
      totalItems: 0,
    };
  }
};

export const getAllCalendarEditions = async (): Promise<
  Partial<CalendarEdition>[] | null
> => {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const editions = await prisma.calendarEdition.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return editions;
  } catch (error) {
    console.error("Error fetching calendar editions:", error);
    return null;
  }
};

export const getEventsByCalendarId = async (
  calendarId: string
): Promise<Partial<Event>[] | null> => {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const events = await prisma.event.findMany({
      where: {
        isDeleted: false,
        calendarEdition: {
          some: {
            id: calendarId,
            userId,
            isDeleted: false,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        isYearly: true,
        year: true,
      },
      orderBy: [{ isYearly: "desc" }, { date: "asc" }],
    });

    return events;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return null;
  }
};
