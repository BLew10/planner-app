"use client";
import React from "react";
import { SlotInfo } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import { MONTHS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdvertisementRowProps {
  slots: SlotInfo[] | null;
  adType: Partial<Advertisement>;
}

const AdvertisementRow: React.FC<AdvertisementRowProps> = ({
  slots,
  adType,
}) => {
  // Transform slots array into a map where keys are month indices and values are arrays of all slots for that month
  const slotsByMonth = (slots || []).reduce((acc, slot) => {
    const monthIndex = slot.month ?? 0;
    if (!acc[monthIndex]) acc[monthIndex] = [];
    acc[monthIndex].push(slot);
    return acc;
  }, {} as Record<number, SlotInfo[]>);

  // Special handling for non-monthly ads (like covers, special sections)
  if (adType.perMonth === 0) {
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-primary">
            {adType.name}
          </h2>
          <Badge variant="outline" className="ml-2 text-xs">
            Special
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {slots && slots.length > 0 ? (
            slots.map((slot) => (
              <Card
                key={slot.slot}
                className="overflow-hidden border shadow-sm bg-primary/5"
              >
                <CardContent className="p-2">
                  <div className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium truncate">
                              {slot.contactCompany || "—"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {slot.contactCompany || "—"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Qty:</span>
                      <span className="font-medium">{slot.slot}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-2 text-xs text-muted-foreground">
              No {adType.name} purchased
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show all months in a grid layout - no scrolling, compact design
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-primary">{adType.name}</h2>
        <Badge variant="outline" className="ml-2 text-xs">
          {adType.perMonth} per month
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {MONTHS.map((month, index) => {
          const monthIndex = index + 1;
          const monthSlots = slotsByMonth[monthIndex] || [];

          return (
            <Card key={month} className="overflow-hidden">
              <CardHeader className="py-1 px-2 bg-primary">
                <CardTitle className="text-xs font-medium text-primary-foreground">
                  {month}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-1 gap-1">
                  {Array.from(
                    { length: adType.perMonth || 0 },
                    (_, slotIndex) => {
                      const slotsForIndex = monthSlots.filter(
                        (s) => s.slot === slotIndex + 1
                      );

                      return slotsForIndex.length === 0 ? (
                        <div
                          key={`empty-${slotIndex}`}
                          className="border border-dashed rounded-sm p-1"
                        >
                          <div className="flex items-center text-xs space-x-1">
                            <Badge
                              variant="outline"
                              className="bg-transparent text-xs h-4 min-w-4"
                            >
                              {slotIndex + 1}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              Available
                            </span>
                          </div>
                        </div>
                      ) : (
                        slotsForIndex.map((slotInfo, i) => (
                          <div
                            key={`slot-${slotIndex}-${i}`}
                            className="border rounded-sm p-1 bg-primary/15"
                          >
                            <div className="flex items-center text-xs space-x-1">
                              <Badge
                                variant="secondary"
                                className="text-xs h-4 min-w-4"
                              >
                                {slotIndex + 1}
                              </Badge>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="truncate text-xs font-medium">
                                      {slotInfo.contactCompany || "—"}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {slotInfo.contactCompany || "—"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        ))
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdvertisementRow;
