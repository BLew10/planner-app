"use client";
import React, { useEffect, useState } from "react";
import PrintInventory from "./PrintInventory";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import { CalendarEdition, Advertisement } from "@prisma/client";
import { ALL_YEARS } from "@/lib/constants";
import useDarkMode from "@/hooks/useDarkMode";
import { useSearchParams } from "next/navigation";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Printer, RotateCcw } from "lucide-react";

export default function PrintCalendarInventoryPage() {
  const [calendars, setCalendars] = useState<Partial<CalendarEdition>[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<
    Partial<CalendarEdition>[]
  >([]);
  const [ads, setAds] = useState<Partial<Advertisement>[]>([]);
  const [selectedAds, setSelectedAds] = useState<Partial<Advertisement>[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [year, setYear] = useState(ALL_YEARS[0].value);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: calendars } = await getAllCalendars();
      const ads = await getAllAdvertisementTypes();
      setCalendars(calendars || []);
      setSelectedCalendars(calendars || []);
      setAds(ads?.data || []);
      setSelectedAds(ads?.data || []);
      setIsLoading(false);
    };
    fetchData();

    const year = searchParams.get("year") || ALL_YEARS[0].value;
    if (isValidYear(year)) {
      setYear(year);
    }
  }, []);

  const isValidYear = (year: string) => {
    return year.length === 4 && !isNaN(Number(year));
  };

  const handleCalendarToggle = (calendarId: string, checked: boolean) => {
    const calendar = calendars.find((c) => c.id === calendarId);
    if (calendar) {
      setSelectedCalendars((prev) => {
        if (checked) {
          return [...prev, calendar];
        } else {
          return prev.filter((c) => c.id !== calendarId);
        }
      });
    }
  };

  const handleAdToggle = (adId: string, checked: boolean) => {
    const ad = ads.find((a) => a.id === adId);
    if (ad) {
      setSelectedAds((prev) => {
        if (checked) {
          return [...prev, ad];
        } else {
          return prev.filter((a) => a.id !== adId);
        }
      });
    }
  };

  const handleYearChange = (value: string) => {
    setYear(value);
  };

  const getFilteredData = async () => {
    setShowFilters(false);
  };

  const handleToggleCalendars = () => {
    if (selectedCalendars.length === calendars.length) {
      setSelectedCalendars([]);
    } else {
      setSelectedCalendars(calendars);
    }
  };

  const handleToggleAds = () => {
    if (selectedAds.length === ads.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(ads);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Print Calendar Inventory
            </CardTitle>
            {!showFilters && (
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
        </CardHeader>
        {showFilters ? (
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={year} onValueChange={handleYearChange}>
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
                  <div className="flex justify-between items-center">
                    <Label>Calendars</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleCalendars}
                    >
                      {selectedCalendars.length === calendars.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {calendars.map((calendar) => (
                      <div
                        key={calendar.id}
                        className="flex items-center space-x-2 bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`calendar-${calendar.id}`}
                          checked={selectedCalendars.some(
                            (c) => c.id === calendar.id
                          )}
                          onCheckedChange={(checked) =>
                            handleCalendarToggle(
                              calendar.id || "",
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`calendar-${calendar.id}`}
                          className="cursor-pointer line-clamp-2 flex-1"
                        >
                          {calendar.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Advertisement Types</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleAds}
                    >
                      {selectedAds.length === ads.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {ads.map((ad) => (
                      <div
                        key={ad.id}
                        className="flex items-center space-x-2 bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`ad-${ad.id}`}
                          checked={selectedAds.some((a) => a.id === ad.id)}
                          onCheckedChange={(checked) =>
                            handleAdToggle(ad.id || "", checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`ad-${ad.id}`}
                          className="cursor-pointer line-clamp-2 flex-1"
                        >
                          {ad.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={getFilteredData}
                disabled={!selectedCalendars.length || !selectedAds.length}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Generate Print View
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            {selectedCalendars.map((calendar) => (
              <section key={calendar.id} className="mt-6 first:mt-0">
                <PrintInventory
                  calendar={calendar}
                  year={year}
                  advertisementTypes={selectedAds}
                />
              </section>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
