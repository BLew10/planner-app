"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma/prisma";
import login, { LoginData } from "./login";
const signUp = async (formData: FormData) => {
  const username = formData.get("username")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  try {
    if (!username || !email || !password || !firstName) {
      return {
        status: 400,
        json: {
          success: false,
          message: "Missing required fields",
        },
      };
    }
    const lowerCaseEmail = email.toLowerCase();
    const lowerCaseUsername = username.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: lowerCaseUsername }, { email: lowerCaseEmail }],
      },
    });
    if (existingUser) {
      return {
        status: 400,
        json: {
          success: false,
          message: "A user with the given username or email already exists.",
        },
      };
    }

    const user = await prisma.user.create({
      data: {
        username: lowerCaseUsername,
        email: lowerCaseEmail,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });
    const data: LoginData = {
      username,
      password
    }
    await login(data);
  } catch (error: any) {
    console.error("Error signing up", error);
    return {
      status: 400,
      json: {
        success: false,
        message: "A user with the given username or email already exists.",
      },
    };
  }
};

export default signUp;
