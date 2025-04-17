"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Canvas } from "./layout-creator/canvas-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdTypes } from "@/hooks/advertisment-type/useAdTypes";
import { useLayout } from "@/hooks/layout/useLayout";
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

interface CustomizableLayoutProps {
  layoutId?: string;
}

export function CustomizableLayout({ layoutId }: CustomizableLayoutProps) {
  const router = useRouter();
  const { adTypes, isLoading: adTypesLoading } = useAdTypes();
  const { layout, isLoading: layoutLoading, createLayout, updateLayout } = useLayout(layoutId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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

  // Load layout data when editing
  useEffect(() => {
    if (layout) {
      setName(layout.name);
      setDescription(layout.description || "");
      // Convert ad placements to savedAreas format
      const areas = layout.adPlacements.map((placement) => ({
        id: placement.id,
        adTypeId: placement.advertisementId,
        adTypeName: placement.advertisement.name,
        slotNumber: 1,
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        position: placement.position as "top" | "bottom",
      }));
      setSavedAreas(areas);
    }
  }, [layout]);

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

  const handleSaveLayout = async () => {
    if (!name || savedAreas.length === 0) return;

    const layoutData = {
      name,
      description,
      savedAreas: savedAreas.map((area) => ({
        adTypeId: area.adTypeId,
        position: area.position,
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
      })),
    };

    if (layoutId) {
      await updateLayout.mutateAsync(layoutData);
    } else {
      await createLayout.mutateAsync(layoutData);
    }

    router.push("/dashboard/layout");
  };

  if (layoutLoading || adTypesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 w-full">
      <div className="space-y-8 max-w-[1800px] mx-auto">
        <div className="w-full bg-white rounded-lg shadow-sm p-4">
          <h1 className="text-2xl font-bold text-center">
            {layoutId ? "Edit Layout" : "Create New Layout"}
          </h1>
        </div>

        <div className="grid grid-cols-[250px_1fr_250px] gap-6">
          {/* Layout Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Layout Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter layout name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter layout description"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Section - Empty */}
          <div />

          {/* Right Side Controls */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Save Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={handleSaveLayout}
                  disabled={!name || savedAreas.length === 0}
                >
                  {layoutId ? "Update Layout" : "Save Layout"}
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

      {/* Ad Type Selection Dialog */}
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
