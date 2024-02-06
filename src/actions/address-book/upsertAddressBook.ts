"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { parseForm } from "@/lib/data/addressBook";

const upsertAddressBook = async (formData: FormData) => {
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

    const userId = session.user?.id;
    const data = parseForm(formData, userId);

    if (!data) return {
      status: 400,
      json: {
        success: false,
        message: "Invalid form data",
      },
    };

    const addressBook = await prisma.addressBook.upsert({
      where: {
        id: data.id || "-1", 
      },
      update: data,
      create: data,
    });

  } catch (error: any) {
    console.error("Error upserting address book", error);

    return {
      status: 500,
      json: {
        success: false,
        message: "Error upserting address book",
      },
    };
  }

  redirect("/dashboard/address-books");
};

export default upsertAddressBook;
