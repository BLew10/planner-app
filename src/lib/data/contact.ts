"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import {
  Contact,
  ContactContactInformation,
  ContactAddress,
  ContactTelecomInformation,
} from "@prisma/client";
import { ContactModel } from "../models/contact";

/**
 * Grab a contact by its id and
 * @param id The id of the contact to retrieve
 * @returns id, customerSince, notes, category, webAddress, and contact information
 */

export interface ContactTableData extends Contact {
  contactContactInformation?: Partial<ContactContactInformation> | null;
  contactTelecomInformation?: Partial<ContactTelecomInformation> | null;
  contactAddress?: Partial<ContactAddress> | null;
}

export const getContactsByAddressBook = async (
  addressBookId: string
): Promise<Partial<ContactTableData>[] | null> => {
  "use server";
  const session = await auth();
  const userId = session?.user?.id;
  if (!addressBookId) {
    const addressBook = await prisma.addressBook.findFirst();
    addressBookId = addressBook?.id || "";
  }

  try {
    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        isDeleted: false,
        ...(addressBookId !== "-1" && {
          addressBooks: {
            some: {
              id: addressBookId,
            },
          },
        }),
      },
      select: {
        id: true,
        customerSince: true,
        notes: true,
        category: true,
        webAddress: true,
        contactContactInformation: true,
        contactTelecomInformation: true,
        contactAddress: true,
      },
    });

    return contacts;
  } catch {
    return null;
  }
};

/**
 * Parses the given FormData object to construct a Contact object suitable for database insertion.
 * This function iterates through the FormData entries, assigning the values to the corresponding
 * properties of a Contact object structure expected by Prisma or your ORM. It handles complex
 * nested structures for contact information, telecom information, and address information.
 *
 * Fields expected from the FormData:
 * - Various contact fields such as phone number, extension, email address, etc.
 * - A category indicating the contact's category.
 * - A list of addressBookIds for connecting the contact to existing address books.
 * - A userId indicating the owner of the contact.
 *
 * Note: If an unexpected field is encountered or if essential fields are missing, the function
 * returns null to indicate a parsing or validation error.
 *
 * @param {FormData} formData - The FormData object containing contact information.
 * @param {string} userId - The userId to be associated with the Contact.
 * @returns {Contact | null} A structured object for contact creation if successful, otherwise null.
 */

export const getContactById = async (id: string) => {
  if (!id) {
    return null;
  }
  const session = await auth();
  const contactId = id;
  const userId = session?.user?.id;
  console.log("contactId", contactId, userId);
  try {
    const contact: Partial<ContactModel> | null =
      await prisma.contact.findFirst({
        where: { id: contactId, userId: userId, isDeleted: false },
        select: {
          id: true,
          customerSince: true,
          notes: true,
          category: true,
          webAddress: true,
          contactContactInformation: true,
          contactTelecomInformation: true,
          contactAddress: true,
          addressBooks: true,
          stripeCustomerId: true,
          purchases: {
            include: {
              adPurchases: {
                include: {
                  adPurchaseSlots: true,
                },
              },
            },
          },
          payments: true,
        },
      });
    console.log(contact);
    return contact;
  } catch (e) {
    console.log("Error getting contact", e);
    return null;
  }
};

export const removeContactStripeCustomerId = async (
  stripeCustomerId: string
) => {
  try {
    const contact = await prisma.contact.update({
      where: { stripeCustomerId },
      data: { stripeCustomerId: null },
    });
    return contact;
  } catch (e) {
    console.log("Error removing contact stripe customer id", e);
    return null;
  }
};

export const deleteManyContacts = async (contactIds: string[]) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const contacts = await prisma.contact.findMany({
        where: {
          id: { in: contactIds },
        },
        select: {
          id: true,
          payments: true,
        },
      });

      const updates = contacts.map(async (contact) => {
        if (contact.payments && contact.payments.length > 0) {
          return prisma.contact.update({
            where: { id: contact.id },
            data: { isDeleted: true },
          });
        } else {
          return prisma.contact.delete({
            where: { id: contact.id },
          });
        }
      });

      // Resolve all update/delete promises
      return Promise.all(updates);
    });

    return true;
  } catch (e) {
    console.log("Error deleting contacts", e);
    return false;
  }
};
