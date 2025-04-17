"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";
import { ContactModel } from "@/lib/models/contact";
import { useContact } from "@/hooks/contact/useContact";
import ContactInfoOverview from "./ContactInfoOverview";
import ContactPurchasesOverview from "./ContactPurchasesOverview";
import ContactPaymentsOverview from "./ContactPaymentsOverview";
import ContactScheduledPayments from "./ContactScheduledPayments";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface ContactOverviewProps {
  contactId: string;
}

type TabValue = "info" | "purchases" | "payments" | "paymentSchedules";

export default function ContactOverview({ contactId }: ContactOverviewProps) {
  const { contact, isLoading } = useContact({ id: contactId });
  const [activeTab, setActiveTab] = useState<TabValue>("info");
  const router = useRouter();

  const contactName = contact
    ? contact.contactContactInformation?.company ||
      `${contact.contactContactInformation?.firstName} ${contact.contactContactInformation?.lastName}`
    : "No Contact Found";

  if (isLoading) {
    return (
      <Card className="w-full max-w-7xl mx-auto my-10">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              <Skeleton className="h-8 w-[200px]" />
            </CardTitle>
            <Skeleton className="h-9 w-[120px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border rounded-lg p-1">
              <div className="grid w-full grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-[140px]" />
                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-12" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && !contact) {
    router.push("/dashboard/contacts");
    return null;
  }

  return (
    <Card className="w-full max-w-7xl mx-auto my-10">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{contactName}</CardTitle>
          <Button asChild variant="edit" size="sm">
            <Link href={`/dashboard/contacts/${contact?.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Contact
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Contact Info</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="payments">Payments Made</TabsTrigger>
            <TabsTrigger value="paymentSchedules">Payment Schedules</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <ContactInfoOverview contact={contact as ContactModel} />
          </TabsContent>
          <TabsContent value="purchases">
            <ContactPurchasesOverview contactId={contactId} />
          </TabsContent>
          <TabsContent value="payments">
            <ContactPaymentsOverview contactId={contactId} />
          </TabsContent>
          <TabsContent value="paymentSchedules">
            <ContactScheduledPayments contactId={contactId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
