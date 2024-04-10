"use server";

import prisma from "@/lib/prisma/prisma";
import { CalendarEdition } from "@prisma/client";
import { auth } from "@/auth";

/**
 * Grab an address book by its id and
 * @param id The id of the address book to retrieve
 * @returns id, name, and displayLevel of the address book
 */
export const getCalendarById = async (
  id: string
): Promise<Partial<CalendarEdition> | null> => {
  "use server";
  const session = await auth();
  const calendarId = id;
  const userId = session?.user?.id;

  try {
    const calendar = await prisma.calendarEdition.findFirst({
      where: { id: calendarId, userId: userId, isDeleted: false},
      select: {
        id: true,
        name: true,
      },
    });

    return calendar;
  } catch {
    return null;
  }
};

/**
 * Grab all address book by the user's id
 * @param id The id of the address book to retrieve
 * @returns id, name, and displayLevel of the address book
 */
export const getAllCalendars = async (): Promise<
  Partial<CalendarEdition>[] | null
> => {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const calendars = await prisma.calendarEdition.findMany({
      where: {
        userId,
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
      },
    });

    return calendars;
  } catch {
    return null;
  }
};

/**
 * Parses the given FormData object to construct an Calendar object. This function
 * iterates through the FormData entries, assigning the values to the corresponding
 * properties of an Calendar object. It also adds a userId to the Calendar object.
 *
 * Fields expected from the FormData:
 * - calendarId: The unique identifier for the address book. If not provided, defaults to "-1".
 * - calendarName: The name of the address book.
 * - displayLevel: The display level of the address book.
 *
 * Note: If an unexpected field is encountered or required fields are missing, the function
 * returns null to indicate a parsing error.
 *
 * @param {FormData} formData - The FormData object containing address book information.
 * @param {string} userId - The userId to be associated with the CalendarEdition.
 * @returns {CalendarEdition | null} An CalendarEdition object if parsing is successful, otherwise null.
 */

export const parseForm = (
  formData: FormData,
  userId: string
): CalendarEdition | null => {
  const formObject = Object.fromEntries(formData.entries());
  const data: Partial<CalendarEdition> = {
    userId,
  };

  for (const [key, value] of Object.entries(formObject)) {
    switch (key) {
      case "calendarEditionId":
        data.id = String(value);
        break;
      case "name":
        data.name = String(value);
        break;
    }
  }

  if (data.name && data.userId) {
    return data as CalendarEdition;
  } else {
    console.error("Missing required fields");
    return null;
  }
};
