import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SharedCellsProps = {
  sharedCells: { cellId: string; selectionLabels: string[] }[];
};

export function SharedCells({ sharedCells }: SharedCellsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Shared Cells</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sharedCells.map((shared) => {
            const [calendarPos, row, col] = shared.cellId.split("-");
            return (
              <li key={shared.cellId} className="text-sm">
                <div>
                  <Badge variant="outline" className="mr-1">
                    {calendarPos === "top" ? "Top" : "Bottom"}
                  </Badge>
                  <span className="font-medium">Cell {row},{col}</span>
                </div>
                <div className="text-muted-foreground">
                  Shared by: {shared.selectionLabels.join(", ")}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
} 