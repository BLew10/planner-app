"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SplitCell = {
  id: string
  label: string
  position: "left" | "right" | "full"
}

type Selection = {
  id: string
  label: string
  cells: string[]
  splits?: Record<string, SplitCell[]>
}

export function CustomizableGrid({
  initialRows = 4,
  initialCols = 6,
}: {
  initialRows?: number
  initialCols?: number
}) {
  const [rows, setRows] = useState(initialRows)
  const [cols, setCols] = useState(initialCols)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [savedSelections, setSavedSelections] = useState<Selection[]>([])
  const [currentLabel, setCurrentLabel] = useState("")
  const [newRows, setNewRows] = useState(initialRows.toString())
  const [newCols, setNewCols] = useState(initialCols.toString())
  const [error, setError] = useState("")
  const [dragMode, setDragMode] = useState(false)
  const [dragStart, setDragStart] = useState<string | null>(null)

  // Create grid cells
  const renderGrid = () => {
    const grid = []

    for (let r = 0; r < rows; r++) {
      const row = []
      for (let c = 0; c < cols; c++) {
        const cellId = `${r}-${c}`
        const isSelected = selectedCells.includes(cellId)

        // Find all selections that include this cell
        const cellSelections = savedSelections.filter((s) => s.cells.includes(cellId))
        const isShared = cellSelections.length > 1

        // Check if this cell has splits
        const hasSplits = cellSelections.some((s) => s.splits && s.splits[cellId])
        const splits = hasSplits
          ? cellSelections.flatMap((s) => (s.splits && s.splits[cellId] ? s.splits[cellId] : []))
          : []

        if (hasSplits) {
          // Render a split cell
          row.push(
            <div
              key={cellId}
              className={cn(
                "border border-gray-300 relative h-20 cursor-pointer transition-colors",
                isSelected && "ring-2 ring-rose-500",
              )}
              onMouseDown={() => handleMouseDown(cellId)}
              onMouseUp={() => handleMouseUp(cellId)}
              onMouseEnter={() => handleMouseEnter(cellId)}
            >
              <div className="absolute inset-0 flex">
                {/* Left split */}
                <div className="w-1/2 flex items-center justify-center border-r border-dashed border-gray-400">
                  {splits.find((s) => s.position === "left") && (
                    <span className="text-sm font-medium">{splits.find((s) => s.position === "left")?.label}</span>
                  )}
                </div>

                {/* Right split */}
                <div className="w-1/2 flex items-center justify-center">
                  {splits.find((s) => s.position === "right") && (
                    <span className="text-sm font-medium">{splits.find((s) => s.position === "right")?.label}</span>
                  )}
                </div>
              </div>
            </div>,
          )
        } else if (cellSelections.length > 0) {
          // Regular assigned cell (not split)
          row.push(
            <TooltipProvider key={cellId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "border border-gray-300 flex items-center justify-center relative",
                      "h-20 cursor-pointer transition-colors",
                      isSelected ? "ring-2 ring-rose-500" : "",
                      isShared ? "bg-purple-200 hover:bg-purple-300" : "bg-blue-200 hover:bg-blue-300",
                    )}
                    onMouseDown={() => handleMouseDown(cellId)}
                    onMouseUp={() => handleMouseUp(cellId)}
                    onMouseEnter={() => handleMouseEnter(cellId)}
                  >
                    {isShared && (
                      <Badge className="absolute top-1 right-1 text-xs" variant="secondary">
                        {cellSelections.length}
                      </Badge>
                    )}
                    <span className="text-sm font-medium">{isShared ? "Shared" : cellSelections[0].label}</span>
                  </div>
                </TooltipTrigger>
                {isShared && (
                  <TooltipContent>
                    <p className="font-semibold">Shared by:</p>
                    <ul className="list-disc list-inside text-sm">
                      {cellSelections.map((selection) => (
                        <li key={selection.id}>{selection.label}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>,
          )
        } else {
          // Unassigned cell
          row.push(
            <div
              key={cellId}
              className={cn(
                "border border-gray-300 flex items-center justify-center",
                "h-20 cursor-pointer transition-colors",
                isSelected ? "bg-rose-500 text-white" : "hover:bg-gray-100",
              )}
              onMouseDown={() => handleMouseDown(cellId)}
              onMouseUp={() => handleMouseUp(cellId)}
              onMouseEnter={() => handleMouseEnter(cellId)}
            >
              <span className="text-xs text-gray-400">{cellId}</span>
            </div>,
          )
        }
      }

      grid.push(
        <div key={`row-${r}`} className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {row}
        </div>,
      )
    }

    return grid
  }

  const handleMouseDown = (cellId: string) => {
    if (!selectionMode) return

    // Check if cell is already in a saved selection
    const existingSelectionIndex = savedSelections.findIndex((s) => s.cells.includes(cellId))

    if (existingSelectionIndex !== -1) {
      // Cell is already assigned
      const existingSelection = savedSelections[existingSelectionIndex]

      // Check if this cell already has splits
      if (existingSelection.splits && existingSelection.splits[cellId]) {
        // Cell is already split, don't allow further splitting
        return
      }

      // For shared cells, we'll allow selecting it again
      // This is different from the previous behavior where we'd prepare for splitting
    }

    // Start a new rectangular selection
    setDragMode(true)
    setDragStart(cellId)
    setSelectedCells([cellId])
  }

  const handleMouseEnter = (cellId: string) => {
    if (!selectionMode || !dragMode || !dragStart) return

    // Update the rectangular selection
    updateRectangularSelection(dragStart, cellId)
  }

  const handleMouseUp = (cellId: string) => {
    if (!selectionMode) return

    // Finalize the selection
    if (dragMode && dragStart) {
      updateRectangularSelection(dragStart, cellId)
      setDragMode(false)
      setDragStart(null)
    }
  }

  const updateRectangularSelection = (startCellId: string, endCellId: string) => {
    // Parse the cell coordinates
    const [startRow, startCol] = startCellId.split("-").map(Number)
    const [endRow, endCol] = endCellId.split("-").map(Number)

    // Calculate the rectangle bounds
    const minRow = Math.min(startRow, endRow)
    const maxRow = Math.max(startRow, endRow)
    const minCol = Math.min(startCol, endCol)
    const maxCol = Math.max(startCol, endCol)

    // Create a new selection with all cells in the rectangle
    const newSelection: string[] = []

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cellId = `${r}-${c}`
        newSelection.push(cellId)
      }
    }

    setSelectedCells(newSelection)
  }

  const saveSelection = () => {
    if (selectedCells.length === 0 || !currentLabel.trim()) return

    // Check if we're splitting an existing cell
    const singleCellId = selectedCells.length === 1 ? selectedCells[0] : null
    const existingSelectionIndex = singleCellId
      ? savedSelections.findIndex((s) => s.cells.includes(singleCellId) && (!s.splits || !s.splits[singleCellId]))
      : -1

    if (existingSelectionIndex !== -1 && singleCellId) {
      // Ask if user wants to split or share
      const wantToSplit = confirm(`Do you want to split cell ${singleCellId}? Click Cancel to share it instead.`)

      if (wantToSplit) {
        // Split the cell
        const cellId = singleCellId
        const updatedSelections = [...savedSelections]
        const existingSelection = updatedSelections[existingSelectionIndex]

        // Initialize splits if needed
        if (!existingSelection.splits) {
          existingSelection.splits = {}
        }

        if (!existingSelection.splits[cellId]) {
          // First split - create left side for existing label
          existingSelection.splits[cellId] = [
            {
              id: `${cellId}-left`,
              label: existingSelection.label,
              position: "left",
            },
          ]
        }

        // Add the new split on the right
        existingSelection.splits[cellId].push({
          id: `${cellId}-right`,
          label: currentLabel,
          position: "right",
        })

        setSavedSelections(updatedSelections)
      } else {
        // Share the cell - just add it to a new selection
        setSavedSelections((prev) => [
          ...prev,
          {
            id: `selection-${Date.now()}`,
            label: currentLabel,
            cells: [...selectedCells],
          },
        ])
      }
    } else {
      // Check if selection forms a rectangle
      const isRectangle = validateRectangle(selectedCells)

      if (!isRectangle) {
        alert("Selection must form a rectangle")
        return
      }

      // Regular selection
      setSavedSelections((prev) => [
        ...prev,
        {
          id: `selection-${Date.now()}`,
          label: currentLabel,
          cells: [...selectedCells],
        },
      ])
    }

    setSelectedCells([])
    setCurrentLabel("")
    setSelectionMode(false)
  }

  const validateRectangle = (cells: string[]): boolean => {
    if (cells.length <= 1) return true

    // Get the coordinates of all cells
    const coords = cells.map((id) => {
      const [row, col] = id.split("-").map(Number)
      return { row, col }
    })

    // Find the bounds of the selection
    const minRow = Math.min(...coords.map((c) => c.row))
    const maxRow = Math.max(...coords.map((c) => c.row))
    const minCol = Math.min(...coords.map((c) => c.col))
    const maxCol = Math.max(...coords.map((c) => c.col))

    // Calculate how many cells should be in the rectangle
    const expectedCellCount = (maxRow - minRow + 1) * (maxCol - minCol + 1)

    // Check if we have the right number of cells
    if (cells.length !== expectedCellCount) {
      return false
    }

    // Check if every cell in the bounds is included
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cellId = `${r}-${c}`
        if (!cells.includes(cellId)) {
          return false
        }
      }
    }

    return true
  }

  const updateGridDimensions = () => {
    const rowsNum = Number.parseInt(newRows)
    const colsNum = Number.parseInt(newCols)

    if (isNaN(rowsNum) || isNaN(colsNum)) {
      setError("Please enter valid numbers")
      return
    }

    if (rowsNum < 2 || colsNum < 2) {
      setError("Dimensions must be at least 2")
      return
    }

    if (rowsNum % 2 !== 0 || colsNum % 2 !== 0) {
      setError("Dimensions must be even numbers")
      return
    }

    setError("")
    setRows(rowsNum)
    setCols(colsNum)

    // Clear selections that would be outside the new grid
    const updatedSelections = savedSelections.filter((selection) => {
      return selection.cells.every((cellId) => {
        const [row, col] = cellId.split("-").map(Number)
        return row < rowsNum && col < colsNum
      })
    })

    setSavedSelections(updatedSelections)
  }

  // Find cells that are shared between multiple selections
  const findSharedCells = () => {
    const cellCounts: Record<string, string[]> = {}

    savedSelections.forEach((selection) => {
      selection.cells.forEach((cellId) => {
        if (!cellCounts[cellId]) {
          cellCounts[cellId] = []
        }
        cellCounts[cellId].push(selection.id)
      })
    })

    return Object.entries(cellCounts)
      .filter(([_, selectionIds]) => selectionIds.length > 1)
      .map(([cellId, selectionIds]) => ({
        cellId,
        selectionIds,
        selectionLabels: selectionIds.map((id) => savedSelections.find((s) => s.id === id)?.label || ""),
      }))
  }

  const sharedCells = findSharedCells()

  return (
    <div className="space-y-6 mx-auto max-w-screen-xl mt-10 w-full">
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
        <h1 className="text-2xl font-bold text-center">Calendar Layout</h1>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[1fr_300px] w-full">
        <div className="space-y-6">
          <Card className="overflow-hidden"
            onMouseLeave={() => {
              if (dragMode) {
                setDragMode(false)
                setDragStart(null)
              }
            }}
          >
            <CardContent className="p-0">
              {renderGrid()}
            </CardContent>
          </Card>

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
                      onClick={() => {
                        setSelectedCells([])
                        setSelectionMode(false)
                      }}
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
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grid Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rows">Rows (must be even)</Label>
                  <Input
                    id="rows"
                    type="number"
                    min="2"
                    step="2"
                    value={newRows}
                    onChange={(e) => setNewRows(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cols">Columns (must be even)</Label>
                  <Input
                    id="cols"
                    type="number"
                    min="2"
                    step="2"
                    value={newCols}
                    onChange={(e) => setNewCols(e.target.value)}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button onClick={updateGridDimensions} className="w-full">
                  Update Grid
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Assigned Areas</CardTitle>
            </CardHeader>
            <CardContent>
              {savedSelections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No areas assigned yet</p>
              ) : (
                <ul className="space-y-2">
                  {savedSelections.map((selection) => (
                    <li key={selection.id} className="flex justify-between items-center text-sm">
                      <span>
                        <span className="font-medium">{selection.label}</span>
                        <span className="text-muted-foreground ml-2">({selection.cells.length} cells)</span>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSavedSelections((prev) => prev.filter((s) => s.id !== selection.id))
                        }}
                        className="h-auto p-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {sharedCells.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Shared Cells</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sharedCells.map((shared) => (
                    <li key={shared.cellId} className="text-sm">
                      <span className="font-medium">Cell {shared.cellId}</span>
                      <span className="text-muted-foreground"> shared by: </span>
                      <span>{shared.selectionLabels.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
