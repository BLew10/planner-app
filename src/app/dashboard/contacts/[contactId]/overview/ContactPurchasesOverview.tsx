import { useState } from "react";
import { getPurchasesByContactId } from "@/lib/data/purchase";
import styles from "./ContactPurchasesOverview.module.scss";
import { Purchase } from "@/lib/data/purchase";
import { MONTHS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useContactPurchases, PurchaseSlots } from "@/hooks/contact/useContactPurchases";

interface ContactPurchasesOverviewProps {
  contactId: string;
}

const groupSlotsByMonth = (slots: PurchaseSlots[]) => {
  return slots.reduce((acc, slot) => {
    const { month } = slot;
    const key = `${month}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {} as { [key: string]: PurchaseSlots[] });
};

const ContactPurchasesOverview = ({
  contactId,
}: ContactPurchasesOverviewProps) => {
  const { groupedPurchases, isLoading } = useContactPurchases({ contactId });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Purchases</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              {[...Array(2)].map((_, yearIndex) => (
                <div key={yearIndex} className="space-y-4">
                  <Skeleton className="h-7 w-20" />
                  <div className="space-y-4">
                    {[...Array(3)].map((_, purchaseIndex) => (
                      <div
                        key={purchaseIndex}
                        className="rounded-lg border p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-6 w-32" />
                          </div>
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {[...Array(6)].map((_, monthIndex) => (
                            <Skeleton
                              key={monthIndex}
                              className="h-14 w-full rounded-md"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : groupedPurchases ? (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              {Object.entries(groupedPurchases).map(([key, value]) => (
                <div key={key} className="space-y-4">
                  <h3 className="text-lg font-semibold">{value.year}</h3>
                  <div className="space-y-4">
                    {value.purchases.map((purchase) => {
                      const monthSlots = purchase.slots
                        ? groupSlotsByMonth(purchase.slots)
                        : null;
                      return (
                        <div
                          key={purchase.id}
                          className="rounded-lg border p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {purchase.calendarName}
                              </p>
                              <p className="text-sm px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full inline-flex items-center font-medium border border-blue-200">
                                {purchase.advertisement.name}
                              </p>
                            </div>
                            <p className="font-medium">
                              Total: ${purchase.charge.toFixed(2)}
                            </p>
                          </div>
                          {monthSlots && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {Object.keys(monthSlots).map((month, i) => (
                                <div
                                  key={month}
                                  className="text-sm bg-muted/50 rounded-md p-2"
                                >
                                  <span className="font-medium">
                                    {MONTHS[i]}:{" "}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {monthSlots[month].map((slot, i) => (
                                      <span key={slot.id}>
                                        {slot.date
                                          ? slot.date.toString()
                                          : `Slot ${slot.slot}`}
                                        {i < monthSlots[month].length - 1 &&
                                          ", "}
                                      </span>
                                    ))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Separator className="my-4" />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No purchases found
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactPurchasesOverview;
