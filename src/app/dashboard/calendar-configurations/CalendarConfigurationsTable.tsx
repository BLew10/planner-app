"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/app/(components)/general/DataTable";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { useRouter } from "next/navigation";

interface CalendarConfiguration {
  id: string;
  calendarEdition: {
    id: string;
    name: string;
    code: string;
  };
  layout: {
    id: string;
    name: string;
  };
  year: number;
}

interface CalendarConfigurationsTableProps {
  configurations: CalendarConfiguration[] | null;
  isLoading: boolean;
  selectedRows: string[];
  onSelectedRowsChange: (rows: string[]) => void;
  onDelete: (id: string) => Promise<boolean>;
  onDeleteSelected: () => Promise<boolean>;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  totalItems: number;
  currentPage: number;
}

export const CalendarConfigurationsTable = ({
  configurations,
  isLoading,
  selectedRows,
  onSelectedRowsChange,
  onDelete,
  onDeleteSelected,
  onSearch,
  onPageChange,
  totalItems,
  currentPage,
}: CalendarConfigurationsTableProps) => {
  const router = useRouter();

  const columns: ColumnDef<CalendarConfiguration>[] = [
    {
      accessorKey: "calendarEdition.name",
      header: "Calendar Edition",
    },
    {
      accessorKey: "calendarEdition.code",
      header: "Edition Code",
    },
    {
      accessorKey: "year",
      header: "Year",
    },
    {
      accessorKey: "layout.name",
      header: "Layout",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const config = row.original;
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/calendar-configurations/${config.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <DeleteButton
              itemType="Configuration"
              itemName={`${config.calendarEdition.name} - ${config.year}`}
              onDelete={() => onDelete(config.id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={configurations || []}
      isLoading={isLoading}
      title="Calendar Configurations"
      onAdd={() => router.push("/dashboard/calendar-configurations/add")}
      onSearch={onSearch}
      onPageChange={onPageChange}
      addButtonLabel="Add Configuration"
      selectedRows={selectedRows}
      onSelectedRowsChange={onSelectedRowsChange}
      onDeleteSelected={onDeleteSelected}
      currentPage={currentPage}
      searchPlaceholder="Search configurations..."
      totalItems={totalItems}
    />
  );
}; 