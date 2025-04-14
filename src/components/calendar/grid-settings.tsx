import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GridSettingsProps = {
  newTopRows: string;
  setNewTopRows: (rows: string) => void;
  newBottomRows: string;
  setNewBottomRows: (rows: string) => void;
  newCols: string;
  setNewCols: (cols: string) => void;
  error: string;
  updateGridDimensions: () => void;
};

export function GridSettings({
  newTopRows,
  setNewTopRows,
  newBottomRows,
  setNewBottomRows,
  newCols,
  setNewCols,
  error,
  updateGridDimensions,
}: GridSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grid Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topRows">Top Calendar Rows</Label>
            <Input
              id="topRows"
              type="number"
              min="1"
              value={newTopRows}
              onChange={(e) => setNewTopRows(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bottomRows">Bottom Calendar Rows</Label>
            <Input
              id="bottomRows"
              type="number"
              min="1"
              value={newBottomRows}
              onChange={(e) => setNewBottomRows(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cols">Columns</Label>
            <Input
              id="cols"
              type="number"
              min="1"
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
  );
} 