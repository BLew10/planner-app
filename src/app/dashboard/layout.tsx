"use client";

import MainMenu from "../(components)/general/MainMenu";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/app/(components)/general/Toaster";
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <MainMenu />
      <Toaster />
      {children}
    </SidebarProvider>
  );
}
