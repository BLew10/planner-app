import prisma from "@/lib/prisma/prisma";
import {
  Contact,
  ContactContactInformation,
  ContactAddress,
  ContactTelecomInformation,
} from "@prisma/client";

export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  password: string;
}

export const getUserByCredential = async (loginInfo: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: loginInfo }, { email: loginInfo }],
      },
    });

    if (!user) return null;

    return {
      ...user,
      id: user.id.toString(),
    };
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) return null;

    return {
      ...user,
      id: user.id.toString(),
    };
  } catch {
    return null;
  }
};