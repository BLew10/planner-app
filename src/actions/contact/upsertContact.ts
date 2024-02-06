"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { parseContactFormData } from "@/lib/data/contact";

const upsertContact = async (formData: FormData) => {
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
    const contactData = parseContactFormData(formData, userId);

    if (!contactData) {
      return {
        status: 400,
        json: {
          success: false,
          message: "Invalid form data",
        },
      };
    }

    let contact;
    const result = await prisma.$transaction(async (prisma) => {
      console.log("Contact Data", contactData);
      contact = await prisma.contact.findFirst({
        where: { id: contactData.id },
      });

      if (contact) {
        contact = await prisma.contact.update({
          where: { id: contact.id },
          data: {
            userId,
            customerSince: contactData.customerSince,
            notes: contactData.notes,
            category: contactData.category,
            webAddress: contactData.webAddress,
          },
        });
      } else {
        contact = await prisma.contact.create({
          data: {
            userId,
            customerSince: contactData.customerSince,
            notes: contactData.notes,
            category: contactData.category,
            webAddress: contactData.webAddress,
          },
        });
      }
      const infoData = contactData.contactContactInformation.data;
      const existingInfo = await prisma.contactContactInformation.findUnique({
        where: { contactId: contact.id },
      });
      if (existingInfo) {
        await prisma.contactContactInformation.update({
          where: { contactId: contact.id },
          data: infoData,
        });
      } else {
        await prisma.contactContactInformation.create({
          data: { ...infoData, contactId: contact.id },
        });
      }

      const telecomData = contactData.contactTelecomInformation.data;
      const existingTelecom = await prisma.contactTelecomInformation.findUnique({
        where: { contactId: contact.id },
      });
      if (existingTelecom) {
        await prisma.contactTelecomInformation.update({
          where: { contactId: contact.id },
          data: telecomData,
        });
      } else {
        await prisma.contactTelecomInformation.create({
          data: { ...telecomData, contactId: contact.id },
        });
      }

      const addressData = contactData.contactAddress.data;
      const existingAddress = await prisma.contactAddress.findUnique({
        where: { contactId: contact.id },
      });

      if (existingAddress) {
        await prisma.contactAddress.update({
          where: { contactId: contact.id },
          data: addressData,
        });
      } else {
        await prisma.contactAddress.create({
          data: { ...addressData, contactId: contact.id },
        });
      }
    });
  } catch (error: any) {
    console.error("Error saving contact", error);
    return {
      status: 500,
      json: { success: false, message: "Error saving contact" },
    };
  }

  redirect("/dashboard/contacts");
};

export default upsertContact;
