"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Canvas } from "./calendar/canvas-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdTypes } from "@/hooks/advertisment-type/useAdTypes";
import { useCalendarEditions } from "@/hooks/calendar-edition/useCalendarEditions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SavedArea {
  id: string;
  adTypeId: string;
  adTypeName: string;
  slotNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  position: "top" | "bottom";
}

export function CustomizableGrid() {
  const { adTypes, isLoading: adTypesLoading } = useAdTypes();
  const { calendarEditions, isLoading: calendarsLoading } =
    useCalendarEditions();
  const [calendarId, setCalendarId] = useState<string>("");
  const [calendarYear, setCalendarYear] = useState<number>(
    new Date().getFullYear()
  );

  const [showDialog, setShowDialog] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    position: "top" | "bottom";
  } | null>(null);
  const [selectedAdTypeId, setSelectedAdTypeId] = useState<string>("");
  const [savedAreas, setSavedAreas] = useState<SavedArea[]>([]);

  // Function to get the next available slot number for an ad type
  const getNextSlotNumber = (adTypeId: string) => {
    const existingSlots = savedAreas
      .filter((area) => area.adTypeId === adTypeId)
      .map((area) => area.slotNumber);

    if (existingSlots.length === 0) return 1;
    return Math.max(...existingSlots) + 1;
  };

  const handleSelectionComplete = (selection: {
    x: number;
    y: number;
    width: number;
    height: number;
    position: "top" | "bottom";
  }) => {
    setCurrentSelection(selection);
    setShowDialog(true);
  };

  const handleSaveArea = () => {
    if (!currentSelection || !selectedAdTypeId) return;

    const selectedAdType = adTypes?.find(
      (type) => type.id === selectedAdTypeId
    );
    if (!selectedAdType?.name) return;

    // Get the next available slot number for this ad type
    const slotNumber = getNextSlotNumber(selectedAdTypeId);

    setSavedAreas((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        adTypeId: selectedAdTypeId,
        adTypeName: selectedAdType.name as string,
        slotNumber,
        position: currentSelection.position,
        x: currentSelection.x,
        y: currentSelection.y,
        width: currentSelection.width,
        height: currentSelection.height,
      },
    ]);

    setShowDialog(false);
    setSelectedAdTypeId("");
    setCurrentSelection(null);
  };

  const handleSaveConfiguration = async () => {
    if (!calendarId || savedAreas.length === 0) return;

    // TODO: Save configuration to backend
    console.log("Saving configuration:", {
      calendarId,
      calendarYear,
      areas: savedAreas,
    });
  };

  const handleCopyFromExisting = async () => {
    // TODO: Implement copying from existing configuration
    console.log("Copy from existing");
  };

  if (adTypesLoading || calendarsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 w-full">
      <div className="space-y-8 max-w-[1800px] mx-auto">
        <div className="w-full bg-white rounded-lg shadow-sm p-4">
          <h1 className="text-2xl font-bold text-center">Calendar Layout</h1>
        </div>

        <div className="grid grid-cols-[250px_1fr_250px] gap-6">
          {/* Configuration Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="calendar">Calendar Edition</Label>
                  <Select value={calendarId} onValueChange={setCalendarId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select calendar" />
                    </SelectTrigger>
                    <SelectContent>
                      {calendarEditions?.map((calendar) => (
                        <SelectItem key={calendar.id} value={calendar.id || ""}>
                          {calendar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Calendar Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={calendarYear}
                    onChange={(e) => setCalendarYear(Number(e.target.value))}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleCopyFromExisting}
                  className="w-full"
                >
                  Copy from Existing Layout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Middle Section - Empty */}
          <div />

          {/* Right Side Controls */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Save Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={handleSaveConfiguration}
                  disabled={!calendarId || savedAreas.length === 0}
                >
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Calendars */}
      <div className="mt-6">
        {/* Top Calendar */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Top Calendar</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="w-full aspect-[3/1]">
              <Canvas
                width="100%"
                height="100%"
                position="top"
                savedAreas={savedAreas.filter(
                  (area) => area.position === "top"
                )}
                onSelectionComplete={handleSelectionComplete}
                onDeleteArea={(areaId) => {
                  setSavedAreas((prev) =>
                    prev.filter((area) => area.id !== areaId)
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Bottom Calendar</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="w-full aspect-[3/1]">
              <Canvas
                width="100%"
                height="100%"
                position="bottom"
                savedAreas={savedAreas.filter(
                  (area) => area.position === "bottom"
                )}
                onSelectionComplete={handleSelectionComplete}
                onDeleteArea={(areaId) => {
                  setSavedAreas((prev) =>
                    prev.filter((area) => area.id !== areaId)
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Name and Ad Type Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Advertisement Type</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adType">Advertisement Type</Label>
              <Select
                value={selectedAdTypeId}
                onValueChange={setSelectedAdTypeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an ad type" />
                </SelectTrigger>
                <SelectContent>
                  {adTypes?.map((type) => {
                    const usedSlots = savedAreas.filter(
                      (area) => area.adTypeId === type.id
                    ).length;
                    const maxSlots = type.perMonth || 0;
                    const isDisabled = maxSlots > 0 && usedSlots >= maxSlots;

                    return (
                      <SelectItem
                        key={type.id}
                        value={type.id || ""}
                        disabled={isDisabled}
                      >
                        {type.name} ({usedSlots}/{maxSlots || "∞"})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setSelectedAdTypeId("");
                setCurrentSelection(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveArea} disabled={!selectedAdTypeId}>
              Save Area
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
