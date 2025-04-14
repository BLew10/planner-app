import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type SelectionControlsProps = {
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  selectedCells: string[];
  currentLabel: string;
  setCurrentLabel: (label: string) => void;
  saveSelection: () => void;
  onCancel: () => void;
};

export function SelectionControls({
  selectionMode,
  setSelectionMode,
  selectedCells,
  currentLabel,
  setCurrentLabel,
  saveSelection,
  onCancel,
}: SelectionControlsProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {!selectionMode ? (
          <Button onClick={() => setSelectionMode(true)} className="w-full">
            Start New Selection
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Selection Mode</h3>
              <Badge variant="secondary">{selectedCells.length} cells selected</Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Label for selection</Label>
              <Input
                id="label"
                value={currentLabel}
                onChange={(e) => setCurrentLabel(e.target.value)}
                placeholder="e.g., Desk A, Storage Zone"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveSelection}
                disabled={selectedCells.length === 0 || !currentLabel.trim()}
                className="flex-1"
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Selection tips:</p>
              <ul className="list-disc list-inside">
                <li>Click and drag to select a rectangle</li>
                <li>Click on an assigned cell to split or share it</li>
                <li>All selections must be rectangular</li>
                <li>You can only select cells from one calendar at a time</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 