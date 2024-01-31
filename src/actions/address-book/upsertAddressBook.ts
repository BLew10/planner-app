"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

const deleteAddressBook = async (formData: FormData) => {
  try {
    const name = formData.get('addressBookName')?.toString() || "";
    const displayLevel = formData.get('displayLevel')?.toString();
    const addressId = formData.get('addressBookId')?.toString() || "-1";

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

    const userId = session.user?.id;

    // Check if an address book with the given addressId exists for the user
    const existingAddressBook = await prisma.addressBook.findFirst({
      where: {
        AND: [{ id: parseInt(addressId) }, { clientId: parseInt(userId) }],
      },
    });

    if (existingAddressBook) {
      // If an address book with the given ID exists, update its properties
      await prisma.addressBook.update({
        where: { id: existingAddressBook.id },
        data: {
          name,
          displayLevel,
        },
      });

      redirect("/dashboard/address-books");
    } else {
      // If an address book with the given ID doesn't exist, create a new one
      await prisma.addressBook.create({
        data: {
          clientId: parseInt(userId),
          name,
          displayLevel,
        },
      });

      redirect("/dashboard/address-books");
    }
  } catch (error: any) {
    // Handle any potential errors here
    console.error("Error upserting address book", error);

    return {
      status: 500,
      json: {
        success: false,
        message: "Error upserting address book",
      },
    };
  }
};

export default deleteAddressBook;
