import prisma from "@/lib/prisma/prisma";

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
    
    return {
      ...user,
      id: user?.id.toString(),
    };
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
