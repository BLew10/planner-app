"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const deleteContact = async (contactId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    await prisma.$transaction(async (prisma) => {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          userId,
        },
        select: {
          id: true,
          payments: true,
        },
      });
      if (contact?.payments && contact?.payments.length > 0) {
        await prisma.contact.update({
          where: {
            id: contactId,
          },
          data: {
            isDeleted: true,
          },
        });
      } else {
        await prisma.contact.delete({
          where: {
            id: contactId,
            userId,
          },
        });

      }
      await prisma.contactAddressBook.deleteMany({
        where: {
          contactId: contactId,
        },
      });
    })
    return true 
  } catch (error: any) {
    // Handle any potential errors here
    console.error("Error deleting contact", error);
    return false
  }
};

export default deleteContact;
