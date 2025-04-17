"use server"

import prisma from "@/lib/prisma/prisma";
import { AddressBook } from "@prisma/client";
import { auth } from "@/auth";

/**
 * Grab an address book by its id and
 * @param id The id of the address book to retrieve
 * @returns id, name, and displayLevel of the address book
 */
export const getAddressBookById = async (
  id: string
): Promise<Partial<AddressBook> | null> => {
  "use server";
  const session = await auth();
  const addressBookId = id;
  const userId = session?.user?.id;

  try {
    const addressBook = await prisma.addressBook.findFirst({
      where: { id: addressBookId, userId: userId },
      select: {
        id: true,
        name: true,
        displayLevel: true,
      },
    });

    return addressBook;
  } catch {
    return null;
  }
};

/**
 * Grab all address books by the user's id with pagination and search
 * @returns address books with pagination data
 */
export const getAllAddressBooks = async (
  page: number | null = null,
  pageSize: number | null = null,
  search: string | null = null
): Promise<{
  data: Partial<AddressBook>[] | null;
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
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [addressBooks, total] = await Promise.all([
      prisma.addressBook.findMany({
        where,
        select: {
          id: true,
          name: true,
          displayLevel: true,
        },
        ...(skip !== undefined && { skip }),
        ...(pageSize && { take: pageSize }),
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.addressBook.count({ where })
    ]);

    return {
      data: addressBooks || [],
      totalItems: total
    };
  } catch (error) {
    console.error('Error fetching address books:', error);
    return {
      data: null,
      totalItems: 0
    };
  }
};

/**
 * Parses the given FormData object to construct an AddressBook object. This function
 * iterates through the FormData entries, assigning the values to the corresponding
 * properties of an AddressBook object. It also adds a userId to the AddressBook object.
 *
 * Fields expected from the FormData:
 * - addressBookId: The unique identifier for the address book. If not provided, defaults to "-1".
 * - addressBookName: The name of the address book.
 * - displayLevel: The display level of the address book.
 *
 * Note: If an unexpected field is encountered or required fields are missing, the function
 * returns null to indicate a parsing error.
 *
 * @param {FormData} formData - The FormData object containing address book information.
 * @param {string} userId - The userId to be associated with the AddressBook.
 * @returns {AddressBook | null} An AddressBook object if parsing is successful, otherwise null.
 */

export const parseForm = (
  formData: FormData,
  userId: string
): AddressBook | null => {
  const formObject = Object.fromEntries(formData.entries());
  const data: Partial<AddressBook> = {
    userId,
  };

  for (const [key, value] of Object.entries(formObject)) {
    switch (key) {
      case "addressBookId":
        data.id = String(value);
        break;
      case "addressBookName":
        data.name = String(value);
        break;
      case "displayLevel":
        data.displayLevel = String(value);
        break;
    }
  }

  if (data.name && data.userId) {
    return data as AddressBook;
  } else {
    console.error("Missing required fields");
    return null;
  }
};
