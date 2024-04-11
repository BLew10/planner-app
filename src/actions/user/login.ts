"use server";

import { getUserByCredential } from "@/lib/data/user";
import { signIn } from "@/auth";
import { DEFAULT_REDIRECT_URL } from "@/routes";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

const login = async (formData: FormData) => {
  const username = formData.get("username")?.toString().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Missing required fields" };
  }

  const user = await getUserByCredential(username);

  if (!user) return { error: "Invalid username" };

  try {
    await signIn("credentials", {
      username,
      password,
    });
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
  if (user) redirect(DEFAULT_REDIRECT_URL);
};

export default login;
