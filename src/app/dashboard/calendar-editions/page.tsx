"use client";

import { useCalendarEditions } from "@/hooks/calendar-edition/useCalendarEditions";
import { CalendarEditionsTable } from "./CalendarEditionsTable";
import { useEffect } from "react";

const CalendarsPage = () => {
  const {
    calendarEditions,
    isLoading,
    selectedRows,
    setSelectedRows,
    handleDelete,
    handleDeleteSelected,
    setPage,
    setSearch,
    page,
    totalItems,
  } = useCalendarEditions({
    itemsPerPage: 10,
  });

  return (
    <div className="container mx-auto px-4 w-full mt-10">
      <CalendarEditionsTable
        calendarEditions={calendarEditions}
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
};

export default CalendarsPage;
