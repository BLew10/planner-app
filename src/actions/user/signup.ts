"use server";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma/prisma";
import { PrismaError } from "@/lib/prisma/prismaEnum";

const signUp = async (formData: FormData) => {
    const username = formData.get('username')?.toString();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const firstName = formData.get('firstName')?.toString();
    const lastName = formData.get('lastName')?.toString();
  try {
    if (!username || !email || !password || !firstName || !lastName) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields",
        status: 400,
      });
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
      return NextResponse.json({
        success: false,
        message: "A user with the given username or email already exists.",
        status: 400,
      });
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

    return NextResponse.json({ success: true, status: 201 });
  } catch (error: any) {
    if (error.code === PrismaError.UniqueConstraintFailed) {
      return NextResponse.json({
        success: false,
        message: "A user with the given username or email already exists.",
        status: 400,
      });
    }

    return NextResponse.json({
      success: false,
      message: "Error creating user",
      status: 400,
    });
  }
};

export default signUp;
