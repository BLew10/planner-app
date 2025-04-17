"use client";

import { useCalendarConfigurations } from "@/hooks/calendar-configuration/useCalendarConfigurations";
import { CalendarConfigurationsTable } from "./CalendarConfigurationsTable";

export default function CalendarConfigurationsPage() {
  const {
    configurations,
    isLoading,
    selectedRows,
    setSelectedRows,
    handleDelete,
    handleDeleteSelected,
    setPage,
    setSearch,
    page,
    totalItems,
  } = useCalendarConfigurations({
    itemsPerPage: 10,
  });

  return (
    <div className="container mx-auto px-8 w-full mt-10">
      <CalendarConfigurationsTable
        configurations={configurations}
        isLoading={isLoading}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onSearch={setSearch}
        totalItems={totalItems}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
