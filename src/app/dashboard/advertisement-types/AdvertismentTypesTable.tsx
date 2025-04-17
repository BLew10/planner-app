import { ColumnDef } from "@tanstack/react-table";
import { Advertisement } from "@prisma/client";
import { DataTable } from "@/app/(components)/general/DataTable";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { MdCheck } from "react-icons/md";
import DeleteButton from "@/app/(components)/general/DeleteButton";

interface AdvertisementTypesTableProps {
  adTypes: Partial<Advertisement>[] | null;
  isLoading: boolean;
  selectedRows: string[];
  onSelectedRowsChange: (rows: string[]) => void;
  onDelete: (id: string) => Promise<boolean>;
  onDeleteSelected: () => Promise<boolean>;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  totalItems: number;
  currentPage: number;
  onAdd: () => void;
  onRowClick: (row: Partial<Advertisement>) => void;
}

export function AdvertisementTypesTable({
  adTypes,
  isLoading,
  selectedRows,
  onSelectedRowsChange,
  onDelete,
  onDeleteSelected,
  onSearch,
  onPageChange,
  totalItems,
  currentPage,
  onAdd,
  onRowClick,
}: AdvertisementTypesTableProps) {
  const columns: ColumnDef<Partial<Advertisement>>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "perMonth",
      header: "Quantity Per Month",
    },
    {
      accessorKey: "isDayType",
      header: "Is Day Type",
      cell: ({ row }) => (row.original.isDayType ? <MdCheck /> : ""),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const adType = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Link href={`/dashboard/advertisement-types/${adType.id}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteButton
              itemType="Advertisement Type"
              itemName={adType.name || ""}
              onDelete={() => onDelete(adType.id || "")}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={adTypes || []}
      isLoading={isLoading}
      title="Advertisement Types"
      onAdd={onAdd}
      onSearch={onSearch}
      onPageChange={onPageChange}
      addButtonLabel="Add Advertisement Type"
      selectedRows={selectedRows}
      onSelectedRowsChange={onSelectedRowsChange}
      onDeleteSelected={onDeleteSelected}
      onRowClick={onRowClick}
      currentPage={currentPage}
      searchPlaceholder="Search advertisement types..."
      totalItems={totalItems}
    />
  );
}