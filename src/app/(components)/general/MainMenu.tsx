"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useThemeStore } from "@/store/themeStore";
import { logout } from "@/actions/user/logout";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  LogOut,
  FileText,
  DollarSign,
  CreditCard,
  InfoIcon,
  Grid,
  Hammer,
  LayoutTemplate,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", urlPath: "/dashboard" },
  { icon: DollarSign, label: "Billing", urlPath: "/dashboard/billing" },
  { icon: CreditCard, label: "Purchases", urlPath: "/dashboard/purchases" },
  { icon: CreditCard, label: "Payments", urlPath: "/dashboard/payments" },
  {
    icon: BookOpen,
    label: "Address Books",
    urlPath: "/dashboard/address-books",
  },
  { icon: Users, label: "Contacts", urlPath: "/dashboard/contacts" },
  {
    icon: FileText,
    label: "Advertisement Types",
    urlPath: "/dashboard/advertisement-types",
  },
  {
    icon: Calendar,
    label: "Calendar Editions",
    urlPath: "/dashboard/calendar-editions",
  },
  {
    icon: LayoutTemplate,
    label: "Layouts",
    urlPath: "/dashboard/layout",
  },
  {
    icon: Hammer,
    label: "Calendar Configurations",
    urlPath: "/dashboard/calendar-configurations",
  },
  {
    icon: InfoIcon,
    label: "Events",
    urlPath: "/dashboard/events",
  },
];

const MainMenu: React.FC = () => {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      {!open && (
        <div className="mx-auto my-[50px]">
          <SidebarTrigger />
        </div>
      )}

      {open && (
        <SidebarHeader>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-xl font-bold overflow-hidden">
              <Image
                src="/images/logo.png"
                alt="Calendar Planner Logo"
                width={40}
                height={40}
              />
              Calendex
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
      )}
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild>
                <Link href={item.urlPath} className="mx-auto">
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {open && (
        <SidebarFooter>
          <div className="flex flex-col space-y-4 p-4">
            <form action={logout}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                type="submit"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </form>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default MainMenu;
