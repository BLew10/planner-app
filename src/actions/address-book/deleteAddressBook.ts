"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

const deleteAddressBook = async (addressId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    await prisma.$transaction(async (prisma) => {
      await prisma.contactAddressBook.deleteMany({
        where: {
          addressBookId: addressId
        }
      })
      await prisma.addressBook.delete({
        where: {
          id: addressId,
          userId,
        },
      });
    })
    return true
  } catch (error: any) {
    console.error("Error deleting address book", error);

   return false
  }
};

export default deleteAddressBook;
