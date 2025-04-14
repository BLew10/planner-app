"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CalendarGrid } from "./calendar/calendar-grid";
import { SelectionControls } from "./calendar/selection-controls";
import { GridSettings } from "./calendar/grid-settings";
import { AssignedAreas } from "./calendar/assigned-areas";
import { SharedCells } from "./calendar/shared-cells";
import { Selection } from "@/types/calendar";

export function CustomizableGrid({
  initialTopRows = 4,
  initialBottomRows = 2,
  initialCols = 6,
}: {
  initialTopRows?: number;
  initialBottomRows?: number;
  initialCols?: number;
}) {
  const [topRows, setTopRows] = useState(initialTopRows);
  const [bottomRows, setBottomRows] = useState(initialBottomRows);
  const [cols, setCols] = useState(initialCols);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [savedSelections, setSavedSelections] = useState<Selection[]>([]);
  const [currentLabel, setCurrentLabel] = useState("");
  const [newTopRows, setNewTopRows] = useState(initialTopRows.toString());
  const [newBottomRows, setNewBottomRows] = useState(initialBottomRows.toString());
  const [newCols, setNewCols] = useState(initialCols.toString());
  const [error, setError] = useState("");
  const [dragMode, setDragMode] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [activeCalendar, setActiveCalendar] = useState<"top" | "bottom" | null>(null);

  // Calculate shared cells for display
  const sharedCells = savedSelections.reduce((acc, selection) => {
    selection.cells.forEach((cellId) => {
      const otherSelections = savedSelections.filter(
        (s) => s.id !== selection.id && s.cells.includes(cellId)
      );
      
      if (otherSelections.length > 0) {
        const existingIndex = acc.findIndex((item) => item.cellId === cellId);
        
        if (existingIndex === -1) {
          acc.push({
            cellId,
            selectionLabels: [
              selection.label,
              ...otherSelections.map((s) => s.label),
            ],
          });
        }
      }
    });
    
    return acc;
  }, [] as { cellId: string; selectionLabels: string[] }[]);

  const handleMouseDown = (cellId: string) => {
    if (!selectionMode) return;

    // Extract calendar position from cellId
    const [calendarPos] = cellId.split("-");
    setActiveCalendar(calendarPos as "top" | "bottom");

    // Start a new rectangular selection
    setDragMode(true);
    setDragStart(cellId);
    setSelectedCells([cellId]);
  };

  const handleMouseUp = (cellId: string) => {
    if (!selectionMode || !dragMode) return;
    
    setDragMode(false);
  };

  const handleMouseEnter = (cellId: string) => {
    if (!selectionMode || !dragMode || !dragStart) return;
    
    // Only allow selecting cells from the same calendar
    const [calendarPos] = cellId.split("-");
    if (calendarPos !== activeCalendar) return;
    
    // Get coordinates for start and current cell
    const [_, startRow, startCol] = dragStart.split("-").map(Number);
    const [__, currentRow, currentCol] = cellId.split("-").map(Number);
    
    // Calculate the rectangle
    const minRow = Math.min(startRow, currentRow);
    const maxRow = Math.max(startRow, currentRow);
    const minCol = Math.min(startCol, currentCol);
    const maxCol = Math.max(startCol, currentCol);
    
    // Create a new selection of cells
    const newSelection = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        newSelection.push(`${activeCalendar}-${r}-${c}`);
      }
    }
    
    setSelectedCells(newSelection);
  };

  const validateRectangle = (cells: string[]) => {
    if (cells.length === 0) return false;
    
    // Extract coordinates
    const coords = cells.map((id) => {
      const [_, row, col] = id.split("-").map(Number);
      return { row, col };
    });
    
    // Find min/max
    const minRow = Math.min(...coords.map((c) => c.row));
    const maxRow = Math.max(...coords.map((c) => c.row));
    const minCol = Math.min(...coords.map((c) => c.col));
    const maxCol = Math.max(...coords.map((c) => c.col));
    
    // Check if the number of cells matches a rectangle
    const expectedCells = (maxRow - minRow + 1) * (maxCol - minCol + 1);
    return cells.length === expectedCells;
  };

  const saveSelection = () => {
    if (selectedCells.length === 0 || !currentLabel.trim()) return;

    // Check if selection forms a rectangle
    const isRectangle = validateRectangle(selectedCells);
    if (!isRectangle) {
      alert("Selection must form a rectangle");
      return;
    }

    // Add the new selection
    setSavedSelections((prev) => [
      ...prev,
      {
        id: `selection-${Date.now()}`,
        label: currentLabel,
        cells: [...selectedCells],
        isShared: selectedCells.some(cellId => 
          prev.some(selection => selection.cells.includes(cellId))
        )
      },
    ]);

    // Reset selection state
    setSelectedCells([]);
    setCurrentLabel("");
    setSelectionMode(false);
  };

  const updateGridDimensions = () => {
    const topRowsNum = Number.parseInt(newTopRows)
    const bottomRowsNum = Number.parseInt(newBottomRows)
    const colsNum = Number.parseInt(newCols)

    if (isNaN(topRowsNum) || isNaN(bottomRowsNum) || isNaN(colsNum)) {
      setError("Please enter valid numbers")
      return
    }

    if (topRowsNum < 1 || bottomRowsNum < 1 || colsNum < 1) {
      setError("Dimensions must be at least 1")
      return
    }

    // Clear any selections that would be outside the new grid
    const updatedSelections = savedSelections.map(selection => {
      const validCells = selection.cells.filter(cellId => {
        const [pos, row, col] = cellId.split("-").map((v, i) => i === 0 ? v : Number(v));
        if (pos === "top" && (Number(row) >= topRowsNum || Number(col) >= colsNum)) return false;
        if (pos === "bottom" && (Number(row) >= bottomRowsNum || Number(col) >= colsNum)) return false;
        return true;
      });
      
      return {
        ...selection,
        cells: validCells
      };
    }).filter(selection => selection.cells.length > 0);

    setSavedSelections(updatedSelections);
    setTopRows(topRowsNum);
    setBottomRows(bottomRowsNum);
    setCols(colsNum);
    setError("");
  };

  return (
    <div className="space-y-6 mx-auto max-w-screen-xl mt-10 w-full">
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
        <h1 className="text-2xl font-bold text-center">Calendar Layout</h1>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[1fr_300px] w-full">
        <div className="space-y-6">
          {/* Selection Mode UI */}
          <SelectionControls
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            selectedCells={selectedCells}
            currentLabel={currentLabel}
            setCurrentLabel={setCurrentLabel}
            saveSelection={saveSelection}
            onCancel={() => {
              setSelectedCells([]);
              setSelectionMode(false);
              setActiveCalendar(null);
            }}
          />

          {/* Top Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CalendarGrid
                calendarPosition="top"
                rows={topRows}
                cols={cols}
                selectedCells={selectedCells}
                savedSelections={savedSelections}
                dragMode={dragMode}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => {
                  if (dragMode) {
                    setDragMode(false);
                    setDragStart(null);
                    setActiveCalendar(null);
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Bottom Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bottom Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CalendarGrid
                calendarPosition="bottom"
                rows={bottomRows}
                cols={cols}
                selectedCells={selectedCells}
                savedSelections={savedSelections}
                dragMode={dragMode}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => {
                  if (dragMode) {
                    setDragMode(false);
                    setDragStart(null);
                    setActiveCalendar(null);
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Grid Settings */}
          <GridSettings
            newTopRows={newTopRows}
            setNewTopRows={setNewTopRows}
            newBottomRows={newBottomRows}
            setNewBottomRows={setNewBottomRows}
            newCols={newCols}
            setNewCols={setNewCols}
            error={error}
            updateGridDimensions={updateGridDimensions}
          />

          {/* Assigned Areas */}
          <AssignedAreas
            savedSelections={savedSelections}
            setSavedSelections={setSavedSelections}
          />

          {/* Shared Cells */}
          {sharedCells.length > 0 && (
            <SharedCells sharedCells={sharedCells} />
          )}
        </div>
      </div>
    </div>
  );
}
