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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, CheckSquare, Square } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const nextYear = new Date().getFullYear() + 1;
const selectFirstYear =
  ALL_YEARS.find((year) => year.value === String(nextYear)) || ALL_YEARS[0];

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState(selectFirstYear.value);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [selectedAdtypes, setSelectedAdtypes] = useState<
    Partial<Advertisement>[]
  >([]);
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
      setSelectedAdtypes(ads || []);
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCalendar) return;
      setFetching(true);
      const adtypesIds = selectedAdtypes.map((ad) => ad.id);

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

  const handleAdTypeToggle = (adId: string, checked: boolean) => {
    if (!advertisementTypes) return;

    if (checked) {
      const adToAdd = advertisementTypes.find((ad) => ad.id === adId);
      if (adToAdd) {
        setSelectedAdtypes((prev) => [...prev, adToAdd]);
      }
    } else {
      setSelectedAdtypes((prev) => prev.filter((ad) => ad.id !== adId));
    }
  };

  const filterByAdtype = async () => {
    if (!selectedCalendar || !selectedYear) return;

    setFetching(true);
    const adTypeIds = selectedAdtypes.map((ad) => ad.id || "");

    const slots = await getAllSlotsByCalendarEditionYearAndCalendarId(
      selectedCalendar,
      selectedYear,
      adTypeIds
    );

    setFetching(false);
    setSlotData(slots || null);
  };

  // Add these new functions for checkbox control
  const checkAllAdTypes = () => {
    if (advertisementTypes) {
      setSelectedAdtypes([...advertisementTypes]);
    }
  };

  const uncheckAllAdTypes = () => {
    setSelectedAdtypes([]);
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Advertisement Types</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkAllAdTypes}
                    className="flex items-center gap-1"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Check All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={uncheckAllAdTypes}
                    className="flex items-center gap-1"
                  >
                    <Square className="h-4 w-4" />
                    Uncheck All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
                {advertisementTypes?.map((ad) => (
                  <div key={ad.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ad-${ad.id}`}
                      checked={selectedAdtypes.some(
                        (selectedAd) => selectedAd.id === ad.id
                      )}
                      onCheckedChange={(checked) =>
                        handleAdTypeToggle(ad.id || "", checked as boolean)
                      }
                    />
                    <Label htmlFor={`ad-${ad.id}`} className="cursor-pointer">
                      {ad.name}
                    </Label>
                  </div>
                ))}
              </div>

              <Button onClick={filterByAdtype} className="w-full mt-2">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <CalendarInventory
        slots={slotData}
        advertisementTypes={selectedAdtypes}
      />
    </div>
  );
};

export default Dashboard;
