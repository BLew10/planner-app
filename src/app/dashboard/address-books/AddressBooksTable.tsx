"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { AddressBook } from "@prisma/client";
import { DataTable } from "@/app/(components)/general/DataTable";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { useRouter } from "next/navigation";

interface AddressBooksTableProps {
  addressBooks: Partial<AddressBook>[] | null;
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

export const AddressBooksTable = ({
  addressBooks,
  isLoading,
  selectedRows,
  onSelectedRowsChange,
  onDelete,
  onDeleteSelected,
  onSearch,
  onPageChange,
  totalItems,
  currentPage,
}: AddressBooksTableProps) => {
  const router = useRouter();

  const columns: ColumnDef<Partial<AddressBook>>[] = [
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
        const addressBook = row.original;
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <Link href={`/dashboard/address-books/${addressBook.id}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteButton
              itemType="Address Book"
              itemName={addressBook.name || ""}
              onDelete={() => onDelete(addressBook.id || "")}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={addressBooks || []}
      isLoading={isLoading}
      title="Address Books"
      onAdd={() => router.push("/dashboard/address-books/add")}
      onSearch={onSearch}
      onPageChange={onPageChange}
      addButtonLabel="Add Address Book"
      selectedRows={selectedRows}
      onSelectedRowsChange={onSelectedRowsChange}
      onDeleteSelected={onDeleteSelected}
      onRowClick={(row) =>
        router.push(`/dashboard/address-books/${row.id}`)
      }
      currentPage={currentPage}
      searchPlaceholder="Search address books..."
      totalItems={totalItems}
    />
  );
};
