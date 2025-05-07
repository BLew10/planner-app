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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    icon: InfoIcon,
    label: "Events",
    urlPath: "/dashboard/events",
  },
  {
    icon: Calendar,
    label: "Calendar Editions",
    urlPath: "/dashboard/calendar-editions",
  },
];

const MainMenu: React.FC = () => {
  const { open } = useSidebar();
  const [calendarExpanded, setCalendarExpanded] = React.useState(false);

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
          
          {/* <SidebarMenuItem>
            <Collapsible
              open={calendarExpanded}
              onOpenChange={setCalendarExpanded}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Calendar Editions</span>
                  {calendarExpanded ? (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Link
                  href="/dashboard/calendar-editions"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span>List</span>
                </Link>
                <Link
                  href="/dashboard/calendar-editions/add"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Add New</span>
                </Link>
                <Link
                  href="/dashboard/calendar-editions/displays"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Displays</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/layout" className="mx-auto">
                <LayoutTemplate />
                <span>Layouts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/calendar-configurations" className="mx-auto">
                <Hammer />
                <span>Configurations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
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
