import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogChoice, Selection } from "@/types/calendar";

type CellAssignmentDialogProps = {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  dialogSelectionIndex: number;
  savedSelections: Selection[];
  dialogChoice: DialogChoice | null;
  setDialogChoice: (choice: DialogChoice | null) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function CellAssignmentDialog({
  showDialog,
  setShowDialog,
  dialogSelectionIndex,
  savedSelections,
  dialogChoice,
  setDialogChoice,
  onCancel,
  onConfirm,
}: CellAssignmentDialogProps) {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cell Already Assigned</DialogTitle>
          <DialogDescription>
            This cell is already part of &quot;
            {dialogSelectionIndex !== -1
              ? savedSelections[dialogSelectionIndex]?.label
              : ""}
            &quot;. Choose how you want to handle this:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <Button
              variant={dialogChoice === "Split" ? "default" : "outline"}
              onClick={() => setDialogChoice("Split")}
              className="w-full justify-start text-left h-auto py-3 px-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      dialogChoice === "Split"
                        ? "bg-primary border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {dialogChoice === "Split" && (
                      <div className="w-2 h-2 rounded-full bg-white mx-auto mt-1"></div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium block">Split</span>
                  <span className="text-sm text-muted-foreground mt-1 block">
                    Divide the cell into two parts. Each part will have its own
                    label and can be assigned independently.
                  </span>
                </div>
              </div>
            </Button>

            <Button
              variant={dialogChoice === "Share" ? "default" : "outline"}
              onClick={() => setDialogChoice("Share")}
              className="w-full justify-start text-left h-auto py-3 px-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      dialogChoice === "Share"
                        ? "bg-primary border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {dialogChoice === "Share" && (
                      <div className="w-2 h-2 rounded-full bg-white mx-auto mt-1"></div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium block">Share</span>
                  <span className="text-sm text-muted-foreground mt-1 block">
                    Allow multiple image types to use this cell. The cell will
                    be marked as shared between different areas.
                  </span>
                </div>
              </div>
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!dialogChoice}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
