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
    isYearly: boolean | undefined,
    year: number | undefined
  ) => {
    if (!dateStr) return "";

    const [month, day] = dateStr.split("-");
    return isYearly ? `${month}/${day} (Yearly)` : `${month}/${day}/${year}`;
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
        return formatDate(event.date, event.isYearly, event.year || undefined);
      },
    },
    {
      id: "eventType",
      header: "Type",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <Badge variant={event.isYearly ? "default" : "outline"}>
            {event.isYearly ? "Yearly" : "One-time"}
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
      <div className="flex items-center justify-between mb-4 bg-gray-100 p-4 rounded-md">
        <h1 className="text-2xl font-bold">Calendar Events</h1>
        <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push("/dashboard/events/export")}>
          Proof <Download className="h-4 w-4" />
        </Button>
      </div>
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
        secondFilterOptions={[...calendarEditions, { id: "all", name: "All Calendar Editions" }].map((calendar) => ({
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
