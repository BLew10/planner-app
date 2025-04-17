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
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
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
  const [copiedArea, setCopiedArea] = useState<SavedArea | null>(null);

  // Load layout data when editing
  useEffect(() => {
    if (layout) {
      setName(layout.name);
      setDescription(layout.description || "");
      
      // Group placements by advertisement type to assign correct slot numbers
      const placementsByType = layout.adPlacements.reduce((acc, placement) => {
        const key = placement.advertisementId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(placement);
        return acc;
      }, {} as Record<string, typeof layout.adPlacements>);

      // Convert placements to areas with correct slot numbers
      const areas = layout.adPlacements.map((placement) => {
        const sameTypeAds = placementsByType[placement.advertisementId];
        // Sort by x and y to ensure consistent slot numbering
        sameTypeAds.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
        const slotNumber = sameTypeAds.findIndex(p => p.id === placement.id) + 1;

        return {
          id: placement.id,
          adTypeId: placement.advertisementId,
          adTypeName: placement.advertisement.name,
          slotNumber,
          x: placement.x,
          y: placement.y,
          width: placement.width,
          height: placement.height,
          position: placement.position as "top" | "bottom",
        };
      });

      setSavedAreas(areas);
    }
  }, [layout]);

  // Add event listener for Escape key to cancel paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && copiedArea) {
        setCopiedArea(null);
        toast({
          title: "Paste cancelled",
          description: "Paste mode has been cancelled",
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copiedArea]);

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
    // If there's a copied area and this is a paste action
    if (copiedArea) {
      const selectedAdType = adTypes?.find(
        (type) => type.id === copiedArea.adTypeId
      );
      
      if (!selectedAdType) return;

      // Check if we've reached the maximum slots for this ad type
      const usedSlots = savedAreas.filter(
        (area) => area.adTypeId === copiedArea.adTypeId
      ).length;
      
      if (selectedAdType.perMonth && usedSlots >= selectedAdType.perMonth) {
        toast({
          title: "Cannot paste area",
          description: `Maximum slots (${selectedAdType.perMonth}) reached for this ad type.`,
          variant: "destructive",
        });
        return;
      }

      // Create new area at the pasted location
      const slotNumber = getNextSlotNumber(copiedArea.adTypeId);
      setSavedAreas((prev) => [
        ...prev,
        {
          ...copiedArea,
          id: Math.random().toString(36).substr(2, 9),
          slotNumber,
          x: selection.x - (copiedArea.width / 2), // Center the pasted area at cursor
          y: selection.y - (copiedArea.height / 2),
          position: selection.position,
        },
      ]);

      // Clear the clipboard
      setCopiedArea(null);
      toast({
        title: "Area pasted",
        description: `Created new ${copiedArea.adTypeName} area`,
      });
    } else {
      setCurrentSelection(selection);
      setShowDialog(true);
    }
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

  const handleCopyArea = (areaId: string) => {
    const areaToCopy = savedAreas.find((area) => area.id === areaId);
    if (!areaToCopy) return;

    // Check if we've reached the maximum slots for this ad type
    const selectedAdType = adTypes?.find(
      (type) => type.id === areaToCopy.adTypeId
    );
    
    if (!selectedAdType) return;

    const usedSlots = savedAreas.filter(
      (area) => area.adTypeId === areaToCopy.adTypeId
    ).length;
    
    if (selectedAdType.perMonth && usedSlots >= selectedAdType.perMonth) {
      toast({
        title: "Cannot copy area",
        description: `Maximum slots (${selectedAdType.perMonth}) reached for this ad type.`,
        variant: "destructive",
      });
      return;
    }

    setCopiedArea(areaToCopy);
    toast({
      title: "Area copied",
      description: "Click and drag on the canvas to paste the area, or press Escape to cancel",
    });
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
                  setSavedAreas((prev) => {
                    // First remove the area
                    const remainingAreas = prev.filter((area) => area.id !== areaId);
                    
                    // Get the deleted area's type to know which slots to renumber
                    const deletedArea = prev.find((area) => area.id === areaId);
                    if (!deletedArea) return remainingAreas;

                    // Renumber slots for the affected ad type
                    return remainingAreas.map((area) => {
                      if (area.adTypeId === deletedArea.adTypeId) {
                        // Get all areas of this type and sort them by current slot number
                        const sameTypeAreas = remainingAreas
                          .filter(a => a.adTypeId === area.adTypeId)
                          .sort((a, b) => a.slotNumber - b.slotNumber);
                        
                        // Find this area's position in the sorted list
                        const newSlotNumber = sameTypeAreas.findIndex(a => a.id === area.id) + 1;
                        return { ...area, slotNumber: newSlotNumber };
                      }
                      return area;
                    });
                  });
                }}
                onCopyArea={handleCopyArea}
                onMoveArea={(areaId, newX, newY) => {
                  setSavedAreas((prev) =>
                    prev.map((area) =>
                      area.id === areaId
                        ? { ...area, x: newX, y: newY }
                        : area
                    )
                  );
                }}
                isPasteMode={!!copiedArea}
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
                  setSavedAreas((prev) => {
                    // First remove the area
                    const remainingAreas = prev.filter((area) => area.id !== areaId);
                    
                    // Get the deleted area's type to know which slots to renumber
                    const deletedArea = prev.find((area) => area.id === areaId);
                    if (!deletedArea) return remainingAreas;

                    // Renumber slots for the affected ad type
                    return remainingAreas.map((area) => {
                      if (area.adTypeId === deletedArea.adTypeId) {
                        // Get all areas of this type and sort them by current slot number
                        const sameTypeAreas = remainingAreas
                          .filter(a => a.adTypeId === area.adTypeId)
                          .sort((a, b) => a.slotNumber - b.slotNumber);
                        
                        // Find this area's position in the sorted list
                        const newSlotNumber = sameTypeAreas.findIndex(a => a.id === area.id) + 1;
                        return { ...area, slotNumber: newSlotNumber };
                      }
                      return area;
                    });
                  });
                }}
                onCopyArea={handleCopyArea}
                onMoveArea={(areaId, newX, newY) => {
                  setSavedAreas((prev) =>
                    prev.map((area) =>
                      area.id === areaId
                        ? { ...area, x: newX, y: newY }
                        : area
                    )
                  );
                }}
                isPasteMode={!!copiedArea}
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
