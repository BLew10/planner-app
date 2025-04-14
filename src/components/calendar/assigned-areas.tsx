import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Selection } from "@/types/calendar";

type AssignedAreasProps = {
  savedSelections: Selection[];
  setSavedSelections: (selections: Selection[] | ((prev: Selection[]) => Selection[])) => void;
};

export function AssignedAreas({ savedSelections, setSavedSelections }: AssignedAreasProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Assigned Areas</CardTitle>
      </CardHeader>
      <CardContent>
        {savedSelections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No areas assigned yet</p>
        ) : (
          <ul className="space-y-3">
            {savedSelections.map((selection) => {
              // Get the calendar position and coordinates for this selection
              const firstCell = selection.cells[0];
              const [calendarPos] = firstCell.split("-");
              
              // Calculate the grid area this selection covers
              const coords = selection.cells.map((id) => {
                const [_, row, col] = id.split("-").map(Number);
                return { row, col };
              });
              
              const minRow = Math.min(...coords.map(c => c.row));
              const maxRow = Math.max(...coords.map(c => c.row));
              const minCol = Math.min(...coords.map(c => c.col));
              const maxCol = Math.max(...coords.map(c => c.col));
              
              const gridArea = `${minRow},${minCol} to ${maxRow},${maxCol}`;
              
              return (
                <li key={selection.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{selection.label}</span>
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
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Badge variant="outline" className="mr-1">
                      {calendarPos === "top" ? "Top" : "Bottom"}
                    </Badge>
                    <span>Grid: {gridArea}</span>
                    <span className="ml-2">({selection.cells.length} cells)</span>
                    {selection.isShared && (
                      <Badge variant="secondary" className="ml-2">Shared</Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
