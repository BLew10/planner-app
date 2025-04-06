"use client";
import React, { useState, useEffect } from "react";
import { usePurchasesStore } from "@/store/purchaseStore";
import { CalendarEdition, Advertisement } from "@prisma/client";
import { MONTHS } from "@/lib/constants";

// Shadcn Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import { Calendar, ArrowRight, DollarSign } from "lucide-react";

interface PurchaseOverviewProps {
  calendars: Partial<CalendarEdition>[];
  advertisementTypes: Partial<Advertisement>[];
  onNext: () => void;
}

const PurchaseOverview = ({
  calendars,
  advertisementTypes,
  onNext,
}: PurchaseOverviewProps) => {
  const [selectedCalendars, setSelectedCalendars] = useState<
    Partial<CalendarEdition>[]
  >([]);
  const { purchaseOverview, total } = usePurchasesStore();

  useEffect(() => {
    const filteredCalendars = calendars?.filter(
      (calendar) => calendar.id && purchaseOverview?.[calendar.id]
    );
    setSelectedCalendars(filteredCalendars || []);
  }, [purchaseOverview, calendars]);

  // Short month abbreviations
  const monthAbbrevs = MONTHS.map((m) => m.slice(0, 3));

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Purchase Overview</h1>
          <h2 className="text-2xl font-semibold text-primary">
            Total:{" "}
            <span className="text-2xl font-light">${total.toFixed(2)}</span>
          </h2>
        </div>

        <div className="grid gap-6">
          {selectedCalendars.map((calendar) => (
            <Card
              key={calendar.id}
              className="overflow-hidden border rounded-lg"
            >
              <CardHeader className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <CardTitle>{calendar.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="w-[80px] font-medium">
                        Qty
                      </TableHead>
                      <TableHead className="w-[200px] font-medium">Package</TableHead>
                      <TableHead className="w-[150px] text-right font-medium">
                        Total Amount
                      </TableHead>
                      <TableHead colSpan={12} className="font-medium">
                        <div className="px-4 py-2">
                          Months and slots purchased
                        </div>
                      </TableHead>
                    </TableRow>
                    <TableRow className="bg-muted/5 border-b">
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      {monthAbbrevs.map((month) => (
                        <TableHead
                          key={month}
                          className="text-center font-medium text-sm py-2"
                        >
                          {month}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advertisementTypes.map((ad) => {
                      const quantity =
                        purchaseOverview?.[calendar.id!]?.[ad.id!]?.quantity ||
                        0;
                      const charge =
                        purchaseOverview?.[calendar.id!]?.[ad.id!]?.charge || 0;

                      if (quantity === 0) return null;

                      return (
                        <TableRow
                          key={ad.id}
                          className="border-b last:border-b-0"
                        >
                          <TableCell className="text-center font-medium">
                            {quantity}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{ad.name}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center justify-center bg-primary/10 border border-primary rounded-md px-3 py-1.5 font-semibold text-primary">
                              <DollarSign className="h-4 w-4 mr-0.5" />
                              {charge}
                            </div>
                          </TableCell>

                          {/* Month cells */}
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (monthNum) => {
                              const slotsInMonth = purchaseOverview?.[
                                calendar.id!
                              ]?.[ad.id!]?.slots?.filter(
                                (s) => s?.month === monthNum
                              );

                              const hasSlots =
                                slotsInMonth && slotsInMonth.length > 0;

                              return (
                                <TableCell
                                  key={monthNum}
                                  className="p-2 align-top"
                                >
                                  {hasSlots && (
                                    <div className="flex flex-col items-center justify-center gap-1 p-2 min-h-[50px]">
                                      {slotsInMonth.map((slot, idx) => (
                                        <div
                                          key={idx}
                                          className="border rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center justify-center"
                                        >
                                          {slot.slot}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </TableCell>
                              );
                            }
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">
              Grand Total
            </div>
            <div className="flex items-center text-xl font-bold text-primary">
              <DollarSign className="h-5 w-5 mr-1" />
              {total.toFixed(2)}
            </div>
          </div>

          <Button onClick={onNext} size="lg" className="gap-2">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOverview;
