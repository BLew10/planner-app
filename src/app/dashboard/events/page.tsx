"use client";

import { useEffect, useState } from "react";
import { useEvents } from "@/hooks/event/useEvents";
import { EventsTable } from "./EventsTable";
import { CalendarEdition } from "@prisma/client";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { DEFAULT_YEAR } from "@/lib/constants";

const CalendarEventsPage = () => {
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
  const [selectedCalendarEdition, setSelectedCalendarEdition] = useState<string>("all");
  const [calendarEditions, setCalendarEditions] = useState<Partial<CalendarEdition>[]>([]);

  // Fetch calendar editions for the filter dropdown
  useEffect(() => {
    const fetchCalendarEditions = async () => {
      const { data } = await getAllCalendars();
      if (data) {
        setCalendarEditions(data);
        console.log(data[0]);
        setSelectedCalendarEdition(data[0].id || "");
      }
    };
    fetchCalendarEditions();
  }, []);

  const {
    events,
    isLoading,
    selectedRows,
    setSelectedRows,
    handleDelete,
    handleDeleteSelected,
    setPage,
    setSearch,
    page,
    totalItems,
    setSelectedYear: setEventsYear,
    setSelectedCalendarEdition: setEventsCalendarEdition,
  } = useEvents({
    itemsPerPage: 10,
    selectedYear,
    selectedCalendarEdition,
  });

  // Handlers for filter changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setEventsYear?.(year);
  };

  const handleCalendarEditionChange = (calendarId: string) => {
    setSelectedCalendarEdition(calendarId);
    setEventsCalendarEdition?.(calendarId);
  };

  return (
    <div className="container mx-auto px-4 w-full mt-10">
      <EventsTable
        events={events}
        isLoading={isLoading}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onSearch={setSearch}
        totalItems={totalItems}
        currentPage={page}
        onPageChange={setPage}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        selectedCalendarEdition={selectedCalendarEdition}
        onCalendarEditionChange={handleCalendarEditionChange}
        calendarEditions={calendarEditions}
      />
    </div>
  );
};

export default CalendarEventsPage;
