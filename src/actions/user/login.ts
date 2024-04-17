"use server";

import { getUserByCredential } from "@/lib/data/user";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export interface LoginData {
  username: string;
  password: string;
}

const login = async (data: LoginData) => {
  const { username, password } = data;

  if (!username || !password) {
    return { error: "Missing required fields" };
  }

  const user = await getUserByCredential(username);

  if (!user) return { error: "Invalid username" };

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: true,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid username or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
};

export default login;
