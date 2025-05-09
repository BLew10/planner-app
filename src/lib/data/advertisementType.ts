"use server";

import prisma from "@/lib/prisma/prisma";
import { Advertisement, Prisma } from "@prisma/client";
import { auth } from "@/auth";

/**
 * Grab an address book by its id and
 * @param id The id of the address book to retrieve
 * @returns id, name, and displayLevel of the address book
 */
export const getAdvertisementTypeById = async (
  id: string
): Promise<Partial<Advertisement> | null> => {
  "use server";
  const session = await auth();
  const advertisementTypeId = id;
  const userId = session?.user?.id;

  try {
    const advertisementType = await prisma.advertisement.findFirst({
      where: { id: advertisementTypeId, userId: userId, isDeleted: false },
      select: {
        id: true,
        name: true,
        isDayType: true,
        perMonth: true,
      },
    });

    return advertisementType;
  } catch {
    return null;
  }
};

/**
 * Grab all address book by the user's id
 * @param id The id of the address book to retrieve
 * @returns id, name, and displayLevel of the address book
 */
export const getAllAdvertisementTypes = async (
  page: number | null = null,
  pageSize: number | null = null,
  search: string | null = null
): Promise<{
  data: Partial<Advertisement>[] | null;
  totalItems: number;
}> => {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const skip = page && pageSize ? (page - 1) * pageSize : undefined;
    const where = {
      userId,
      isDeleted: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [adTypes, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        select: {
          id: true,
          name: true,
          perMonth: true,
          isDayType: true,
        },
        ...(skip !== undefined && { skip }),
        ...(pageSize && { take: pageSize }),
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.advertisement.count({ where })
    ]);

    return {
      data: adTypes || [],
      totalItems: total
    };
  } catch (error) {
    console.error('Error fetching advertisement types:', error);
    return {
      data: null,
      totalItems: 0
    };
  }
};

export const getManyAdvertisementTypes = async (
  ids: string[]
): Promise<
  Partial<Advertisement>[] | null
> => {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const advertisementTypes = await prisma.advertisement.findMany({
      where: {
        userId,
        id: { in: ids },
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        isDayType: true,
        perMonth: true,
      },
    });

    return advertisementTypes;
  } catch {
    return null;
  }
};

/**
 * Parses the given FormData object to construct an AdvertisementType object. This function
 * iterates through the FormData entries, assigning the values to the corresponding
 * properties of an AdvertisementType object. It also adds a userId to the AdvertisementType object.
 *
 * Fields expected from the FormData:
 * - advertisementTypeId: The unique identifier for the address book. If not provided, defaults to "-1".
 * - advertisementTypeName: The name of the address book.
 * - displayLevel: The display level of the address book.
 *
 * Note: If an unexpected field is encountered or required fields are missing, the function
 * returns null to indicate a parsing error.
 *
 * @param {FormData} formData - The FormData object containing address book information.
 * @param {string} userId - The userId to be associated with the Advertisement.
 * @returns {Advertisement | null} An Advertisement object if parsing is successful, otherwise null.
 */

export const parseForm = (
  formData: FormData,
  userId: string
): Advertisement | null => {
  const formObject = Object.fromEntries(formData.entries());
  const data: Partial<Advertisement> = {
    userId,
    isDayType: false,
  };

  for (const [key, value] of Object.entries(formObject)) {
    switch (key) {
      case "advertisementId":
        data.id = String(value);
        break;
      case "name":
        data.name = String(value);
        break;
      case "perMonth":
        data.perMonth = Number(value);
        break;
      case "isDayType":
        data.isDayType = Boolean(value);
        break;
    }
  }

  if (data.name && data.userId) {
    return data as Advertisement;
  } else {
    console.error("Missing required fields");
    return null;
  }
};
