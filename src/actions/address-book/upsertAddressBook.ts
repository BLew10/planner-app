"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

export interface AddressBookFormData {
  name: string;
  displayLevel: string;
}

const upsertAddressBook = async (
  formData: AddressBookFormData,
  id?: string | null
) => {
  try {
    const session = await auth();

    const userId = session?.user?.id;
    const data = {
      ...formData,
      userId,
    };

    if (!data) return false;
    const addressBook = await prisma.addressBook.upsert({
      where: {
        id: id || "-1",
      },
      update: data,
      create: data,
    });

    return true;
  } catch (error: any) {
    console.error("Error upserting address book", error);
    return false;
  }
};

export default upsertAddressBook;
