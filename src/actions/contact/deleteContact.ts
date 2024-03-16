"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const deleteContact = async (formData: FormData) => {
  try {
    const session = await auth();
    if (!session) {
      return {
        status: 401,
        json: {
          success: false,
          message: "Not authenticated",
        },
      };
    }
    const contactId = formData.get("contactId")?.toString() || "-1";
    const userId = session.user?.id;

    await prisma.$transaction(async (prisma) => {
      await prisma.contactAddressBook.deleteMany({
        where: {
          contactId: contactId,
        },
      });
  
      await prisma.contact.delete({
        where: {
          id: contactId,
          userId,
        },
      });
    })

  } catch (error: any) {
    // Handle any potential errors here
    console.error("Error deleting contact", error);

    return {
      status: 500,
      json: {
        success: false,
        message: "Error deleting contact",
      },
    };
  }

  revalidatePath("/dashboard/contacts");
};

export default deleteContact;
