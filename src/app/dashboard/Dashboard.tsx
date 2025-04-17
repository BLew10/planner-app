"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarEdition, Advertisement } from "@prisma/client";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import { getAllSlotsByCalendarEditionYearAndCalendarId } from "@/lib/data/purchase";
import { ALL_YEARS } from "@/lib/constants";
import { SlotInfo } from "@/lib/data/purchase";
import CalendarInventory from "./CalendarInventory";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const nextYear = new Date().getFullYear() + 1;
const selectFirstYear =
  ALL_YEARS.find((year) => year.value === String(nextYear)) || ALL_YEARS[0];

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState(selectFirstYear.value);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [slotData, setSlotData] = useState<Record<string, SlotInfo[]> | null>(
    null
  );
  const [advertisementTypes, setAdvertisementTypes] = useState<
    Partial<Advertisement>[] | null
  >([]);
  const [calendarData, setCalendarData] = useState<
    Partial<CalendarEdition>[] | null
  >([]);
  const [fetching, setFetching] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchFilterData = async () => {
      const { data: calendars } = await getAllCalendars();
      setSelectedCalendar(calendars?.[0]?.id || "");
      setCalendarData(calendars || []);
      const { data: ads } = await getAllAdvertisementTypes();
      setAdvertisementTypes(ads || []);
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCalendar || !advertisementTypes?.length) return;
      setFetching(true);
      const adtypesIds = advertisementTypes.map((ad) => ad.id);

      const slots = await getAllSlotsByCalendarEditionYearAndCalendarId(
        selectedCalendar,
        selectedYear,
        adtypesIds || []
      );
      setFetching(false);
      setSlotData(slots || null);
    };

    fetchData();
  }, [selectedYear, selectedCalendar, advertisementTypes]);

  useEffect(() => {
    const year = searchParams.get("year");

    if (year) {
      setSelectedYear(year);
    }
  }, [searchParams]);

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  const handleCalendarChange = (value: string) => {
    setSelectedCalendar(value);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!calendarData?.length) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No Calendars Found. Please create a Calendar Edition.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl w-full">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Calendar Inventory
            </h1>
            <Button variant="outline" asChild>
              <a
                href={`/print?year=${selectedYear}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Inventory
              </a>
            </Button>
          </div>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_YEARS.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar">Calendar</Label>
                <Select
                  value={selectedCalendar}
                  onValueChange={handleCalendarChange}
                >
                  <SelectTrigger id="calendar">
                    <SelectValue placeholder="Select Calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendarData.map((calendar) => (
                      <SelectItem key={calendar.id} value={calendar.id || ""}>
                        {calendar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <CalendarInventory
        slots={slotData}
        advertisementTypes={advertisementTypes}
      />
    </div>
  );
};

export default Dashboard;
