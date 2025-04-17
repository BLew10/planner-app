"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable } from "@/app/(components)/general/DataTable";
import { useLayoutList } from "@/hooks/layout/useLayoutList";
import { useLayout } from "@/hooks/layout/useLayout";
import { getLayoutColumns } from "./LayoutColumns";

export default function LayoutListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { layouts, isLoading, totalPages, totalItems } = useLayoutList({ search, page });
  const { deleteLayout } = useLayout();

  const handleDelete = async (id: string) => {
    try {
      await deleteLayout.mutateAsync(id);
      return true;
    } catch (error) {
      console.error("Failed to delete layout:", error);
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedRows.map(id => deleteLayout.mutateAsync(id)));
      setSelectedRows([]);
      return true;
    } catch (error) {
      console.error("Failed to delete selected layouts:", error);
      return false;
    }
  };

  const columns = getLayoutColumns(handleDelete);

  return (
    <div className="container mx-auto p-10">
      <DataTable
        columns={columns}
        data={layouts || []}
        isLoading={isLoading}
        title="Calendar Layouts"
        onAdd={() => router.push("/dashboard/layout/create")}
        onSearch={setSearch}
        onPageChange={setPage}
        addButtonLabel="Create New Layout"
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onDeleteSelected={handleDeleteSelected}
        onRowClick={(row) => router.push(`/dashboard/layout/${row.id}`)}
        currentPage={page}
        searchPlaceholder="Search layouts..."
        totalItems={totalItems}
        itemsPerPage={10}
      />
    </div>
  );
}
