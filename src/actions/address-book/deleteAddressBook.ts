"use server";

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

const upsertAddressBook = async (formData: FormData) => {
  try {
    const addressId = formData.get("addressId")?.toString() || "-1";

    const session = await auth();
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Not authenticated",
        status: 401,
      });
    }

    const userId = session.user?.id;

    // Check if an address book with the given addressId exists for the user
    const existingAddressBook = await prisma.addressBook.findFirst({
      where: {
        AND: [{ id: parseInt(addressId) }, { clientId: parseInt(userId) }],
      },
    });

    if (existingAddressBook) {
      // If an address book with the given ID exists, delete it
      await prisma.addressBook.delete({
        where: { id: existingAddressBook.id },
      });

      redirect("dashboard/address-books");
    } else {
      return NextResponse.json({
        success: false,
        message: "Address book not found",
        status: 404,
      });
    }
  } catch (error: any) {
    // Handle any potential errors here
    console.error("Error deleting address book",error);

    return NextResponse.json({
      success: false,
      message: "Error deleting address book",
      status: 500,
    });
  }
};

export default upsertAddressBook;
