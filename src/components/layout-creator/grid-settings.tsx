import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface GridSettingsProps {
  topRows: number;
  bottomRows: number;
  cols: number;
}

export function GridSettings({
  topRows,
  bottomRows,
  cols,
}: GridSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grid Dimensions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium">Top Rows</div>
            <div className="text-2xl font-bold">{topRows}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Bottom Rows</div>
            <div className="text-2xl font-bold">{bottomRows}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Columns</div>
            <div className="text-2xl font-bold">{cols}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 