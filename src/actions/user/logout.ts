"use server";

import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export const logout = async () => {
  console.log("Logging out");
  await signOut();
  redirect("/");
};