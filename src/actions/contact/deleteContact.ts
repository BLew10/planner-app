"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

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
          purchases: true,
        },
      });

      //TODO: Check if contact has payments or purchases
      if (
        (contact?.payments && contact?.payments.length > 0) ||
        (contact?.purchases && contact?.purchases.length > 0)
      ) {
        await prisma.contact.update({
          where: {
            id: contactId,
          },
          data: {
            isDeleted: true,
          },
        });
        await prisma.contactTelecomInformation.update({
          where: {
            contactId,
          },
          data: {
            email: null,
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
    });
    console.log("Contact deleted", contactId);
    return true;
  } catch (error: any) {
    // Handle any potential errors here
    console.error("Error deleting contact", error);
    return false;
  }
};

export default deleteContact;
