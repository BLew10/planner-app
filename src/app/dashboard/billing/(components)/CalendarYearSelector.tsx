import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_YEARS, DEFAULT_YEAR } from "@/lib/constants";

interface CalendarYearSelectorProps {
  selectedYear: string;
  onYearChange: (value: string) => void;
  hideAllYears?: boolean;
}

const CalendarYearSelector: React.FC<CalendarYearSelectorProps> = ({
  selectedYear,
  onYearChange,
  hideAllYears = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="calendarYear">Calendar Edition Year</Label>
      <Select
        value={selectedYear}
        onValueChange={onYearChange}
        defaultValue={DEFAULT_YEAR}
      >
        <SelectTrigger className="w-[180px]" id="calendarYear">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {!hideAllYears && <SelectItem value="all">All Years</SelectItem>}
          {ALL_YEARS.map((yearOption) => (
            <SelectItem key={yearOption.value} value={yearOption.value}>
              {yearOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CalendarYearSelector;
