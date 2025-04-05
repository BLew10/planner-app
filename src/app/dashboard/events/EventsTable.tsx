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
    dateStr: string | undefined,
    endDateStr: string | undefined,
    isYearly: boolean | undefined,
    year: number | undefined,
    isMultiDay: boolean | undefined,
    startTime: string | undefined,
    endTime: string | undefined
  ) => {
    if (!dateStr) return "";

    const [month, day] = dateStr.split("-");

    let dateDisplay = isYearly ? `${month}/${day}` : `${month}/${day}/${year}`;

    // For multi-day events
    if (isMultiDay && endDateStr) {
      const [endMonth, endDay] = endDateStr.split("-");
      const endDateDisplay = isYearly
        ? `${endMonth}/${endDay}`
        : `${endMonth}/${endDay}/${year}`;
      dateDisplay = `${dateDisplay} - ${endDateDisplay}`;
    }

    // Add time if provided
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
          event.date,
          event.endDate ?? undefined,
          event.isYearly,
          event.year || undefined,
          event.isMultiDay,
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
        let badgeText = "One-time";
        if (event.isYearly) badgeText = "Yearly";
        if (event.isMultiDay)
          badgeText = event.isYearly ? "Multi-day Yearly" : "Multi-day";

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
