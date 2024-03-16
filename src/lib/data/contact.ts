"use server"

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import {
  Contact,
  ContactContactInformation,
  ContactAddress,
  ContactTelecomInformation,
} from "@prisma/client";

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
  "use server"
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
        contactContactInformation: {
          select: {
            firstName: true,
            lastName: true,
            altContactFirstName: true,
            altContactLastName: true,
            salutation: true,
            company: true,
          },
        },
        contactTelecomInformation: {
          select: {
            phone: true,
            extension: true,
            altPhone: true,
            fax: true,
            cellPhone: true,
            homePhone: true,
          },
        },
        contactAddress: {
          select: {
            address: true,
            address2: true,
            city: true,
            state: true,
            zip: true,
            country: true,
          },
        },
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

interface ContactSaveData extends Contact {
  contactContactInformation: ContactInfoData;
  contactTelecomInformation: TelecomInfoData;
  contactAddress: AddressData;
  addressBooks: { id: string }[];
}

interface ContactInfoData {
  data: Partial<ContactContactInformation>;
}

interface TelecomInfoData {
  data: Partial<ContactTelecomInformation>;
}

interface AddressData {
  data: Partial<ContactAddress>;
}

export const parseContactFormData = (
  formData: FormData,
  userId: string
): ContactSaveData | null => {
  // Add further validation as necessary
  if (!userId) {
    console.error("Missing required fields or relations");
    return null;
  }

  const contactId = formData.get("contactId")?.toString() || "";
  // Initialize the structure for ContactSaveData with default values
  const contactContactInformation: ContactInfoData = {
    data: {
      firstName: formData.get("contactFirstName")?.toString() || "",
      lastName: formData.get("contactLastName")?.toString() || "",
      altContactFirstName:
        formData.get("altContactFirstName")?.toString() || "",
      altContactLastName: formData.get("altContactLastName")?.toString() || "",
      salutation: formData.get("salutation")?.toString() || "",
      company: formData.get("company")?.toString() || "",
    },
  };

  const contactTelecomInformation: TelecomInfoData = {
    data: {
      phone: formData.get("phoneNumber")?.toString() || "",
      extension: formData.get("extension")?.toString() || "",
      altPhone: formData.get("altPhoneNumber")?.toString() || "",
      fax: formData.get("fax")?.toString() || "",
      cellPhone: formData.get("cell")?.toString() || "",
      homePhone: formData.get("homePhone")?.toString() || "",
    },
  };

  const contactAddress: AddressData = {
    data: {
      address: formData.get("address1")?.toString() || "",
      address2: formData.get("address2")?.toString() || "",
      city: formData.get("city")?.toString() || "",
      state: formData.get("state")?.toString() || "",
      zip: formData.get("zipCode")?.toString() || "",
      country: formData.get("country")?.toString() || "",
    },
  };

  const addressBooks: {id: string }[] = [];
  // Handling multiple addressBookIds for many-to-many relation
  formData.getAll("addressBookIds").forEach((id) => {
    const addressBookId = id.toString();
    addressBooks.push({ id: addressBookId });
  });

  // Directly assigning other fields with simple validation or transformation as needed
  const contactData: ContactSaveData = {
    userId,
    id: formData.get("contactId")?.toString() || "",
    customerSince: formData.get("customerSince")?.toString() || "",
    notes: formData.get("notes")?.toString() || "",
    category: formData.get("category")?.toString() || "",
    webAddress: formData.get("webAddress")?.toString() || "",
    contactContactInformation,
    contactTelecomInformation,
    contactAddress,
    addressBooks,
  };

  return contactData;
};


export const getContactById = async (id: string) => {

  if (!id) {
    return null;
  }
  const session = await auth();
  const contactId = id;
  const userId = session?.user?.id;

  try {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: userId },
      select: {
        id: true,
        customerSince: true,
        notes: true,
        category: true,
        webAddress: true,
        contactContactInformation: {
          select: {
            firstName: true,
            lastName: true,
            altContactFirstName: true,
            altContactLastName: true,
            salutation: true,
            company: true,
          },
        },
        contactTelecomInformation: {
          select: {
            phone: true,
            extension: true,
            altPhone: true,
            fax: true,
            cellPhone: true,
            homePhone: true,
          },
        },
        contactAddress: {
          select: {
            address: true,
            address2: true,
            city: true,
            state: true,
            zip: true,
            country: true,
          },
        },
        addressBooks: {
          select: {
            id: true,
          },
        },
      },
    });
    return contact;
  } catch {
    return null;
  }
}