export type SplitCell = {
  id: string;
  label: string;
  position: "left" | "right" | "full";
};

export type Selection = {
  id: string;
  label: string;
  cells: string[];
  isShared?: boolean;
};

export type DialogChoice = "Split" | "Share"; 