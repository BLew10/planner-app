"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";
import { upsertStripeCustomer } from "@/lib/helpers/stripeHelpers";

export interface ContactFormData {
  customerSince: string;
  notes: string;
  category: string;
  webAddress: string;
  firstName: string | null;
  lastName: string | null;
  altContactFirstName: string | null;
  altContactLastName: string | null;
  salutation: string | null;
  company: string | null;
  extension: string | null;
  phone: string | null;
  altPhone: string | null;
  fax: string | null;
  email: string | null;
  cellPhone: string | null;
  homePhone: string | null;
  address: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  addressBooksIds: {
    id: string;
  }[];
}

const upsertContact = async (
  formData: ContactFormData,
  contactId: string | null
) => {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        status: 401,
        json: {
          success: false,
          message: "Not authenticated",
        },
      };
    }
    const userId = session.user.id;
    const data = {
      formData,
      userId,
    };

    if (!data || !userId) return false;
    const contactContactInformation = {
      company: formData.company as string,
      altContactFirstName: formData.altContactFirstName as string,
      altContactLastName: formData.altContactLastName as string,
      salutation: formData.salutation as string,
      firstName: formData.firstName as string,
      lastName: formData.lastName as string,
    };
    const telecomInformation = {
      phone: formData.phone?.trim() as string,
      altPhone: formData.altPhone as string,
      email: formData.email as string,
      extension: formData.extension as string,
      fax: formData.fax as string,
      cellPhone: formData.cellPhone as string,
      homePhone: formData.homePhone as string,
    };
    const addressInformation = {
      address: formData.address as string,
      address2: formData.address2 as string,
      city: formData.city as string,
      state: formData.state as string,
      zip: formData.zip as string,
      country: formData.country as string,
    };

    const contactDataUpdate: Prisma.ContactUpdateInput = {
      user: { connect: { id: userId } },
      customerSince: formData.customerSince,
      notes: formData.notes,
      category: formData.category,
      webAddress: formData.webAddress.trim(),
      contactContactInformation: {
        update: contactContactInformation,
      },
      contactTelecomInformation: {
        update: telecomInformation,
      },
      contactAddress: {
        update: addressInformation,
      },
      addressBooks: {
        connect: formData.addressBooksIds,
      },
    };

    const contactData: Prisma.ContactCreateInput = {
      user: { connect: { id: userId } },
      customerSince: formData.customerSince,
      notes: formData.notes,
      category: formData.category,
      webAddress: formData.webAddress,
      contactContactInformation: {
        create: contactContactInformation,
      },
      contactTelecomInformation: {
        create: telecomInformation,
      },
      contactAddress: {
        create: addressInformation,
      },
      addressBooks: {
        connect: formData.addressBooksIds,
      },
    };

    const result = await prisma.contact.upsert({
      where: { id: contactId || "-1" },
      update: contactDataUpdate,
      create: contactData,
    });

    if (!result) return false

    const stripeCustomer = await upsertStripeCustomer(
      result.stripeCustomerId || "",
      formData.email || "",
    )
    
    if (stripeCustomer)
      await prisma.contact.update({
        where: { id: result.id },
        data: {
          stripeCustomerId: stripeCustomer.id
        }
      })

    return true;
  } catch (error: any) {
    console.error("Error saving contact", error);
    return false;
  }
};

export default upsertContact;
