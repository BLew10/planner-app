"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const deleteAddressBook = async (formData: FormData) => {
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
    const addressId = formData.get("addressId")?.toString() || "-1";
    const userId = session.user?.id;

    await prisma.addressBook.delete({
      where: {
        id: addressId,
        userId,
      },
    });
  } catch (error: any) {
    // Handle any potential errors here
    console.error("Error deleting address book", error);

    return {
      status: 500,
      json: {
        success: false,
        message: "Error deleting address book",
      },
    };
  }

  revalidatePath("/dashboard/address-book");
  redirect("/dashboard/address-books");
};

export default deleteAddressBook;
