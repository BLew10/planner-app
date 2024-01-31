import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma/prisma";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({
      success: false,
      message: "Not authenticated",
      status: 401,
    });
  }

  const { addressBookName, displayLevel } = await request.json();

  try {
    const newAddressBook = await prisma.addressBook.create({
      data: {
        name: addressBookName,
        displayLevel,
        clientId: session.user?.id, // Assuming userId is part of the session object
      },
    });

    return NextResponse.json({ newAddressBook, status: 200 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error creating address book",
      status: 400,
    });
  }
}
