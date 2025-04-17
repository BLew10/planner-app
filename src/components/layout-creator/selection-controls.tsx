import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Advertisement } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectionControlsProps {
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  selectedCells: string[];
  currentAdType: Partial<Advertisement> | null;
  setCurrentAdType: (adType: Partial<Advertisement> | null) => void;
  adTypes: Partial<Advertisement>[] | null;
  onSave: () => void;
  onCancel: () => void;
}

export function SelectionControls({
  selectionMode,
  setSelectionMode,
  selectedCells,
  currentAdType,
  setCurrentAdType,
  adTypes,
  onSave,
  onCancel,
}: SelectionControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selection Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant={selectionMode ? "secondary" : "outline"}
            onClick={() => setSelectionMode(!selectionMode)}
          >
            {selectionMode ? "Cancel Selection" : "Start Selection"}
          </Button>
          {selectionMode && (
            <Button variant="outline" onClick={onCancel}>
              Clear Selection
            </Button>
          )}
        </div>

        {selectionMode && selectedCells.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Select
                value={currentAdType?.id || ""}
                onValueChange={(value) => {
                  const adType = adTypes?.find((ad) => ad.id === value) || null;
                  setCurrentAdType(adType);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select advertisement type" />
                </SelectTrigger>
                <SelectContent>
                  {adTypes?.map((adType) => (
                    <SelectItem key={adType.id} value={adType.id || ""}>
                      {adType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={onSave}
              disabled={!currentAdType}
              className="w-full"
            >
              Save Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 