"use client";

import { useState } from "react";
import { useConfigurations } from "@/hooks/configuration/useConfigurations";
import { DisplayCanvas } from "@/components/display-canvas/display-canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Layout, AdPlacement } from "@prisma/client";

// Type matching the API response
interface ApiLayout {
  id: string;
  name: string;
  adPlacements?: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    position: string;
    advertisement: {
      id: string;
      name: string;
    };
  }[];
}

function transformLayoutForDisplay(layout: ApiLayout): Layout & {
  adPlacements: (AdPlacement & {
    advertisement: {
      name: string;
    };
  })[];
} {
  if (!layout) {
    throw new Error("Layout is required");
  }

  return {
    ...layout,
    description: null,
    isDeleted: false,
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    adPlacements: layout.adPlacements?.map(placement => ({
      ...placement,
      layoutId: layout.id,
      advertisementId: placement.advertisement.id,
    })) || [],
  } as Layout & {
    adPlacements: (AdPlacement & {
      advertisement: {
        name: string;
      };
    })[];
  };
}

export default function DisplaysPage() {
  const { configurations, isLoading } = useConfigurations();
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const selectedConfig = configurations?.find(
    (config) => config.id === selectedConfigId
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading configurations...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Early return if no configurations are available
  if (!configurations || configurations.length === 0) {
    return (
      <div className="container mx-auto p-10">
        <Card>
          <CardHeader>
            <CardTitle>No configurations available</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-10">
      <Card>
        <CardHeader>
          <CardTitle>Display Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-2 max-w-md">
              <Label htmlFor="configuration">Select Configuration</Label>
              <Select
                value={selectedConfigId}
                onValueChange={setSelectedConfigId}
              >
                <SelectTrigger id="configuration">
                  <SelectValue placeholder="Select a configuration" />
                </SelectTrigger>
                <SelectContent>
                  {configurations?.map((config) => (
                    <SelectItem key={config.id} value={config.id}>
                      {config.calendarEdition.name} - {config.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedConfig && selectedConfig.layout && (
              <div className="w-full">
                <DisplayCanvas
                  layout={transformLayoutForDisplay(selectedConfig.layout)}
                  calendarEditionId={selectedConfig.calendarEdition.id}
                  year={selectedConfig.year}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
