export type SplitCell = {
  id: string;
  label: string;
  position: "left" | "right" | "full";
};

export interface Selection {
  id: string;
  label: string;
  cells: string[];
  advertisementId?: string;
  isShared?: boolean;
}

export interface CanvasArea {
  id: string;
  name: string;
  adTypeId: string;
  adTypeName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CalendarConfiguration {
  id: string;
  calendarId: string;
  calendarYear: number;
  areas: CanvasArea[];
  createdAt: Date;
  updatedAt: Date;
}

export type DialogChoice = "Split" | "Share"; 