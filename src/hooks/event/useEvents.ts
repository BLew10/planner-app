import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getAllEvents } from "@/lib/data/event";
import { Event } from "@prisma/client";
import deleteEvent from "@/actions/events/deleteEvent";

interface UseEventsOptions {
  itemsPerPage: number;
  selectedYear?: string;
  selectedCalendarEdition?: string;
}

export const useEvents = ({
  itemsPerPage,
  selectedYear = "all",
  selectedCalendarEdition = "all",
}: UseEventsOptions) => {
  const [events, setEvents] = useState<Partial<Event>[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [year, setSelectedYear] = useState<string>(selectedYear);
  const [calendarEdition, setSelectedCalendarEdition] = useState<string>(selectedCalendarEdition);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const calendarEditionId = selectedCalendarEdition !== "all" ? selectedCalendarEdition : null;
      const yearFilter = selectedYear !== "all" ? selectedYear : null;
      
      const { data, totalItems: total } = await getAllEvents(
        calendarEditionId,
        page,
        itemsPerPage,
        search,
        yearFilter
      );
      
      setEvents(data);
      setTotalItems(total);
      setSelectedRows([]);
    } catch (error) {
      toast({
        title: "Error fetching calendar events",
        description: "There was a problem loading the calendar events.",
        variant: "destructive",
      });
      setEvents(null);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, page, search, selectedYear, selectedCalendarEdition]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    try {
      const deleted = await deleteEvent(id);
      if (deleted) {
        toast({
          title: "Calendar event deleted",
          description: "The calendar event has been successfully deleted.",
        });
        fetchEvents();
        return true;
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error deleting calendar event",
        description: "There was a problem deleting the calendar event.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const results = await Promise.all(
        selectedRows.map((id) => deleteEvent(id))
      );

      if (results.every(Boolean)) {
        toast({
          title: "Calendar events deleted",
          description: "The selected calendar events have been deleted.",
        });
        setSelectedRows([]);
        fetchEvents();
        return true;
      } else {
        throw new Error("Some deletions failed");
      }
    } catch (error) {
      toast({
        title: "Error deleting calendar events",
        description: "There was a problem deleting some calendar events.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    events,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    page,
    setPage,
    search,
    setSearch,
    handleDelete,
    handleDeleteSelected,
    setSelectedYear,
    setSelectedCalendarEdition,
  };
};
