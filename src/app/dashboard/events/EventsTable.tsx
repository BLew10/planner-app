"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Event, CalendarEdition } from "@prisma/client";
import { DataTable } from "@/app/(components)/general/DataTable";
import { Button } from "@/components/ui/button";
import { Download, Edit } from "lucide-react";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

import { ALL_YEARS } from "@/lib/constants";
import {
  formatEventSchedule,
  getEffectiveScheduleType,
} from "@/lib/events/recurrence";

interface EventsTableProps {
  events:
    | (Partial<Event> & { calendarEdition?: Partial<CalendarEdition>[] })[]
    | null;
  isLoading: boolean;
  selectedRows: string[];
  onSelectedRowsChange: (rows: string[]) => void;
  onDelete: (id: string) => Promise<boolean>;
  onDeleteSelected: () => Promise<boolean>;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  totalItems: number;
  currentPage: number;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  selectedCalendarEdition?: string;
  onCalendarEditionChange?: (calendarId: string) => void;
  calendarEditions?: Partial<CalendarEdition>[];
}

export const EventsTable = ({
  events,
  isLoading,
  selectedRows,
  onSelectedRowsChange,
  onDelete,
  onDeleteSelected,
  onSearch,
  onPageChange,
  totalItems,
  currentPage,
  selectedYear,
  onYearChange = () => {},
  selectedCalendarEdition,
  onCalendarEditionChange = () => {},
  calendarEditions = [],
}: EventsTableProps) => {
  const router = useRouter();

  const formatDate = (
    event: Partial<Event>,
    startTime: string | undefined,
    endTime: string | undefined
  ) => {
    const year =
      selectedYear && selectedYear !== "all"
        ? parseInt(selectedYear, 10)
        : event.year ?? new Date().getFullYear();
    let dateDisplay = formatEventSchedule(event, year);

    const timeDisplay = [];
    if (startTime) timeDisplay.push(`Start: ${startTime}`);
    if (endTime) timeDisplay.push(`End: ${endTime}`);

    if (timeDisplay.length > 0) {
      dateDisplay += ` (${timeDisplay.join(", ")})`;
    }

    return dateDisplay;
  };

  const columns: ColumnDef<
    Partial<Event> & { calendarEdition?: Partial<CalendarEdition>[] }
  >[] = [
    {
      accessorKey: "name",
      header: "Event Name",
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => {
        const event = row.original;
        return formatDate(
          event,
          event.startTime ?? undefined,
          event.endTime ?? undefined
        );
      },
    },
    {
      id: "eventType",
      header: "Type",
      cell: ({ row }) => {
        const event = row.original;
        const scheduleType = getEffectiveScheduleType(event);
        const badgeText =
          scheduleType === "DAILY_RANGE"
            ? "Daily range"
            : scheduleType === "MONTHLY_DAY"
            ? "Monthly day"
            : scheduleType === "MONTHLY_ORDINAL_WEEKDAY"
            ? "Monthly weekday"
            : event.isYearly
            ? "Yearly"
            : "One-time";

        return (
          <Badge variant={event.isYearly ? "default" : "outline"}>
            {badgeText}
          </Badge>
        );
      },
    },
    {
      id: "calendarEditions",
      header: "Calendar Editions",
      cell: ({ row }) => {
        const event = row.original;
        return event.calendarEdition?.map((edition) => edition.code).join(", ");
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <Link href={`/dashboard/events/${event.id}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteButton
              itemType="Calendar Event"
              itemName={event.name || ""}
              onDelete={() => onDelete(event.id || "")}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Button
        variant="outline"
        className="ml-auto flex items-center gap-2 mb-4"
        onClick={() => router.push("/dashboard/events/export")}
      >
        Export Calendar Events PDF <Download className="h-4 w-4" />
      </Button>
      <DataTable
        columns={columns}
        data={events || []}
        isLoading={isLoading}
        title="Calendar Events"
        onAdd={() => router.push("/dashboard/events/add")}
        onSearch={onSearch}
        filterOptions={ALL_YEARS}
        defaultFilterValue={selectedYear}
        filterPlaceholder="Select Year"
        onFilterChange={onYearChange}
        defaultSecondFilterValue={selectedCalendarEdition}
        secondFilterOptions={[
          ...calendarEditions,
          { id: "all", name: "All Calendar Editions" },
        ].map((calendar) => ({
          value: calendar.id || "",
          label: `${calendar.name} (${calendar.code || "N/A"})`,
        }))}
        secondFilterPlaceholder="Select Calendar Edition"
        onSecondFilterChange={onCalendarEditionChange}
        onPageChange={onPageChange}
        addButtonLabel="Add Calendar Event"
        selectedRows={selectedRows}
        onSelectedRowsChange={onSelectedRowsChange}
        onDeleteSelected={onDeleteSelected}
        onRowClick={(row) => router.push(`/dashboard/events/${row.id}`)}
        currentPage={currentPage}
        searchPlaceholder="Search calendar events..."
        totalItems={totalItems}
      />
    </>
  );
};
