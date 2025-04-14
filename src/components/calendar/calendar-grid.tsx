import { cn } from "@/lib/utils";
import { Selection } from "@/types/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CalendarGridProps = {
  calendarPosition: "top" | "bottom";
  rows: number;
  cols: number;
  selectedCells: string[];
  savedSelections: Selection[];
  dragMode: boolean;
  onMouseDown: (cellId: string) => void;
  onMouseUp: (cellId: string) => void;
  onMouseEnter: (cellId: string) => void;
  onMouseLeave: () => void;
};

export function CalendarGrid({
  calendarPosition,
  rows,
  cols,
  selectedCells,
  savedSelections,
  dragMode,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
}: CalendarGridProps) {
  const renderGrid = () => {
    const grid = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const cellId = `${calendarPosition}-${r}-${c}`;
        const isSelected = selectedCells.includes(cellId);

        // Find all selections that include this cell
        const cellSelections = savedSelections.filter((s) => s.cells.includes(cellId));
        const isShared = cellSelections.length > 1;

        if (cellSelections.length > 0) {
          // Assigned cell
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
                    onMouseDown={() => onMouseDown(cellId)}
                    onMouseUp={() => onMouseUp(cellId)}
                    onMouseEnter={() => onMouseEnter(cellId)}
                  >
                    {isShared && (
                      <Badge className="absolute top-1 right-1 text-xs" variant="secondary">
                        {cellSelections.length}
                      </Badge>
                    )}
                    <span className="text-sm font-medium">
                      {isShared ? "Shared" : cellSelections[0].label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isShared ? (
                    <>
                      <p className="font-semibold">Shared by:</p>
                      <ul className="list-disc list-inside text-sm">
                        {cellSelections.map((selection) => (
                          <li key={selection.id}>{selection.label}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>{cellSelections[0].label}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>,
          );
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
              onMouseDown={() => onMouseDown(cellId)}
              onMouseUp={() => onMouseUp(cellId)}
              onMouseEnter={() => onMouseEnter(cellId)}
            >
              <span className="text-xs text-gray-400">{r}-{c}</span>
            </div>,
          );
        }
      }

      grid.push(
        <div key={`${calendarPosition}-row-${r}`} className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {row}
        </div>,
      );
    }

    return grid;
  };

  return (
    <div className="overflow-hidden" onMouseLeave={onMouseLeave}>
      {renderGrid()}
    </div>
  );
}
