"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function GridSettings({
  rows,
  cols,
  updateGridDimensions,
}: {
  rows: number
  cols: number
  updateGridDimensions: (rows: number, cols: number) => void
}) {
  const [newRows, setNewRows] = useState(rows.toString())
  const [newCols, setNewCols] = useState(cols.toString())
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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
    updateGridDimensions(rowsNum, colsNum)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grid Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full">
            Update Grid
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
