"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarEdition } from "@prisma/client";
import { DataTable } from "@/app/(components)/general/DataTable";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { useRouter } from "next/navigation";

interface CalendarEditionsTableProps {
  calendarEditions: Partial<CalendarEdition>[] | null;
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

export const CalendarEditionsTable = ({
  calendarEditions,
  isLoading,
  selectedRows,
  onSelectedRowsChange,
  onDelete,
  onDeleteSelected,
  onSearch,
  onPageChange,
  totalItems,
  currentPage,
}: CalendarEditionsTableProps) => {
  const router = useRouter();

  const columns: ColumnDef<Partial<CalendarEdition>>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const calendar = row.original;
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <Link href={`/dashboard/calendar-editions/${calendar.id}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteButton
              itemType="Calendar Edition"
              itemName={calendar.name || ""}
              onDelete={() => onDelete(calendar.id || "")}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={calendarEditions || []}
      isLoading={isLoading}
      title="Calendar Editions"
      onAdd={() => router.push("/dashboard/calendar-editions/add")}
      onSearch={onSearch}
      onPageChange={onPageChange}
      addButtonLabel="Add Calendar Edition"
      selectedRows={selectedRows}
      onSelectedRowsChange={onSelectedRowsChange}
      onDeleteSelected={onDeleteSelected}
      onRowClick={(row) =>
        router.push(`/dashboard/calendar-editions/${row.id}`)
      }
      currentPage={currentPage}
      searchPlaceholder="Search calendar editions..."
      totalItems={totalItems}
    />
  );
};
