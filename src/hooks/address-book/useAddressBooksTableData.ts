import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { CalendarEdition } from "@prisma/client";
import deleteCalendar from "@/actions/calendar-editions/deleteCalendarEdition";

export const useCalendarEditions = ({
  itemsPerPage = 10,
}: { itemsPerPage?: number } = {}) => {
  const [calendarEditions, setCalendarEditions] = useState<
    Partial<CalendarEdition>[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const fetchCalendarEditions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, totalItems: total } = await getAllCalendars(
        page,
        itemsPerPage,
        search
      );
      setCalendarEditions(data);
      setTotalItems(total);
      setSelectedRows([]);
    } catch (error) {
      toast({
        title: "Error fetching calendar editions",
        description: "There was a problem loading the calendar editions.",
        variant: "destructive",
      });
      setCalendarEditions(null);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, page, search]);

  useEffect(() => {
    fetchCalendarEditions();
  }, [fetchCalendarEditions]);

  const handleDelete = async (id: string) => {
    try {
      const deleted = await deleteCalendar(id);
      if (deleted) {
        toast({
          title: "Calendar edition deleted",
          description: "The calendar edition has been successfully deleted.",
        });
        fetchCalendarEditions();
        return true;
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error deleting calendar edition",
        description: "There was a problem deleting the calendar edition.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const results = await Promise.all(
        selectedRows.map((id) => deleteCalendar(id))
      );

      if (results.every(Boolean)) {
        toast({
          title: "Calendar editions deleted",
          description: "The selected calendar editions have been deleted.",
        });
        setSelectedRows([]);
        fetchCalendarEditions();
        return true;
      } else {
        throw new Error("Some deletions failed");
      }
    } catch (error) {
      toast({
        title: "Error deleting calendar editions",
        description: "There was a problem deleting some calendar editions.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    calendarEditions,
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
  };
};
