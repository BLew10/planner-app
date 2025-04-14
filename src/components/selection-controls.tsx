"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SelectionControls({
  selectionMode,
  setSelectionMode,
  currentLabel,
  setCurrentLabel,
  confirmSelection,
  cancelSelection,
  selectionCount,
}: {
  selectionMode: boolean
  setSelectionMode: (mode: boolean) => void
  currentLabel: string
  setCurrentLabel: (label: string) => void
  confirmSelection: () => void
  cancelSelection: () => void
  selectionCount: number
}) {
  const handleStartSelection = () => {
    console.log("Starting selection mode")
    setSelectionMode(true)
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {!selectionMode ? (
        <Button onClick={handleStartSelection} className="w-full">
          Start New Selection
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Selection Mode</h3>
            <span className="text-sm bg-primary/10 px-2 py-1 rounded">{selectionCount} cells selected</span>
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
              onClick={confirmSelection}
              disabled={selectionCount === 0 || !currentLabel.trim()}
              className="flex-1"
            >
              Confirm
            </Button>
            <Button variant="outline" onClick={cancelSelection} className="flex-1">
              Cancel
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Selection rules:</p>
            <ul className="list-disc list-inside">
              <li>Cells must be adjacent</li>
              <li>Only horizontal or vertical lines allowed</li>
              <li>No diagonal selections</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
