"use client";

import MainMenu from "../(components)/general/MainMenu";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/app/(components)/general/Toaster";
import QueryProvider from "@/providers/query-provider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <SidebarProvider>
        <MainMenu />
        <Toaster />
        {children}
      </SidebarProvider>
    </QueryProvider>
  );
}
