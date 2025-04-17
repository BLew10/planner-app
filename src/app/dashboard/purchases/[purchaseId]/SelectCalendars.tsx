"use client";

import React, { useEffect } from "react";
import { CalendarEdition } from "@prisma/client";
import { usePurchasesStore } from "@/store/purchaseStore";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import { ALL_YEARS } from "@/lib/constants";
import { motion } from "framer-motion";

// Shadcn components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, ChevronRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SelectCalendarsProps {
  calendars: Partial<CalendarEdition>[];
  purchase?: Partial<PurchaseOverviewModel> | null;
  onNext: () => void;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  year: string;
}

const SelectCalendars = ({
  calendars,
  onNext,
  purchase,
  onYearChange,
  year,
}: SelectCalendarsProps) => {
  const purchaseStore = usePurchasesStore();

  useEffect(() => {
    if (purchase && !purchaseStore.purchaseOverview) {
      purchase.calendarEditions?.forEach((calendar) => {
        purchaseStore.addCalendarId(calendar.id);
      });
    }
  }, [purchase, purchaseStore]);

  const handleChange = (checked: boolean | "indeterminate", calendarId: string) => {
    if (checked) {
      purchaseStore.addCalendarId(calendarId);
    } else {
      purchaseStore.removeCalendarId(calendarId);
    }
  };

  // Convert the original onChange handler to work with the new Select component
  const handleYearSelectChange = (value: string) => {
    const syntheticEvent = {
      target: { value },
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onYearChange(syntheticEvent);
  };
  
  const selectedCalendarsCount = Object.keys(purchaseStore.purchaseOverview || {}).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <CalendarDays className="h-5 w-5 text-muted-foreground" /> 
            Select Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            defaultValue={year}
            onValueChange={handleYearSelectChange}
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {ALL_YEARS.map((yearOption) => (
                <SelectItem key={yearOption.value} value={yearOption.value}>
                  {yearOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <CalendarDays className="h-5 w-5 text-muted-foreground" /> 
            Select Calendars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-3">
              {calendars.map((calendar) => {
                const isChecked = !!purchaseStore.purchaseOverview?.[calendar.id as string];
                
                return (
                  <div 
                    key={calendar.id} 
                    className={`flex items-center p-3 rounded-md border-2 transition-all ${
                      isChecked 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-muted-foreground/20"
                    }`}
                    onClick={() => handleChange(!isChecked, calendar.id as string)}
                  >
                    <div className="flex items-center space-x-3 w-full cursor-pointer">
                      <div className={`flex justify-center items-center h-6 w-6 rounded ${
                        isChecked 
                          ? "bg-primary" 
                          : "border-2 border-muted-foreground/30"
                      }`}>
                        {isChecked && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <Label
                        htmlFor={`calendar-${calendar.id}`}
                        className="flex-1 cursor-pointer font-medium"
                      >
                        {calendar.name}
                      </Label>
                      <Checkbox
                        id={`calendar-${calendar.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleChange(checked, calendar.id as string)}
                        className="sr-only" // Visually hidden but still accessible
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm font-medium">
              {selectedCalendarsCount} calendar{selectedCalendarsCount !== 1 ? 's' : ''} selected
            </div>
            <Button 
              onClick={onNext} 
              className="flex items-center gap-1"
              disabled={selectedCalendarsCount === 0}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SelectCalendars;
