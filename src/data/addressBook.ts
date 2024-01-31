import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

export const getAddressBookById = async (id: string) => {
  const session = await auth();
  const addressBookId = parseInt(id);
  const clientId = parseInt(session?.user?.id);

  try {
    const addressBook = await prisma.addressBook.findFirst({
      where: {
        AND: [{ id: addressBookId }, { clientId: clientId }],
      },
    });

    return addressBook;
  } catch {
    return null;
  }
};

export const getUserById = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return {
      ...user,
      id: user?.id.toString(),
    };
  } catch {
    return null;
  }
};

export const getAllAddressBooks = async () => {
  const session = await auth();
  const clientId = parseInt(session?.user?.id);

  try {
    const addressBooks = await prisma.addressBook.findMany({
      where: {
        clientId,
      },
      select: {
        id: true,
        name: true,
        displayLevel: true}
    });

    return addressBooks;
  } catch {
    return null;
  }
};

