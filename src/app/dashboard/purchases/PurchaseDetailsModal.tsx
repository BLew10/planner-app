"use client";

import { useEffect, useState } from "react";
import { getAllSlotsFromPurchase } from "@/lib/data/purchase";
import { CalendarSlots } from "@/lib/data/purchase";
import { MONTHS } from "@/lib/constants";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";

// Shadcn UI components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, X } from "lucide-react";

interface PurchaseDetailsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  title?: string;
  purchaseId: string;
}

export default function PurchaseDetailsModal({
  isOpen,
  closeModal,
  title,
  purchaseId,
}: PurchaseDetailsModalProps) {
  const [data, setData] = useState<Record<string, CalendarSlots> | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      const data = await getAllSlotsFromPurchase(purchaseId);
      setData(data || null);
      setIsFetching(false);
    };
    fetchData();
  }, [purchaseId]);

  // Use direct onClick for guaranteed close behavior
  const handleClose = () => {
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-semibold text-xl flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {title || "Calendar Slots"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          {isFetching ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              {data &&
                Object.entries(data).map(([calendarId, calendar]) => (
                  <div key={calendarId} className="space-y-4">
                    <h3 className="text-lg font-bold text-primary border-b pb-2">
                      {calendar.name}
                    </h3>

                    {Object.entries(calendar.ads).map(([adId, ad]) => (
                      <Card
                        key={adId}
                        className="border-l-4 border-l-primary shadow-sm"
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium text-lg mb-3">
                            {ad.name}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {ad.slots.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex flex-col gap-1 bg-muted/30 p-2 rounded-md"
                              >
                                <Badge className="w-fit text-xs font-semibold">
                                  {MONTHS[slot.month - 1]}
                                </Badge>
                                <div className="text-sm">
                                  <span className="font-medium">Slot:</span>{" "}
                                  {slot.slot}
                                </div>
                                {slot.date && (
                                  <div className="text-sm">
                                    <span className="font-medium">Date:</span>{" "}
                                    {slot.date}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}

              {data && Object.keys(data).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No calendar slot data found for this purchase.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button onClick={handleClose} variant="default">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
