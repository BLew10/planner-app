import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarEdition } from "@prisma/client";

interface CalendarEditionsResponse {
  calendarEditions: CalendarEdition[];
  totalItems: number;
  totalPages: number;
}

interface UseCalendarEditionsProps {
  itemsPerPage?: number;
}

export function useCalendarEditions({ itemsPerPage = 10 }: UseCalendarEditionsProps = {}) {
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<CalendarEditionsResponse>({
    queryKey: ["calendar-editions", { search, page }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        search,
        page: page.toString(),
      });
      const response = await fetch(`/api/calendar-editions?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch calendar editions");
      }
      return response.json();
    },
  });

  const deleteCalendarEdition = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/calendar-editions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete calendar edition");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-editions"] });
      toast.success("Calendar edition deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteCalendarEdition.mutateAsync(id);
      return true;
    } catch (error) {
      console.error("Failed to delete calendar edition:", error);
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedRows.map(id => deleteCalendarEdition.mutateAsync(id)));
      setSelectedRows([]);
      return true;
    } catch (error) {
      console.error("Failed to delete selected calendar editions:", error);
      return false;
    }
  };

  return {
    calendarEditions: data?.calendarEditions || null,
    isLoading,
    selectedRows,
    setSelectedRows,
    handleDelete,
    handleDeleteSelected,
    setPage,
    setSearch,
    page,
    totalItems: data?.totalItems || 0,
    totalPages: data?.totalPages || 1,
  };
}
