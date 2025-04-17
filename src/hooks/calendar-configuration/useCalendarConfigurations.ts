import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CalendarConfiguration {
  id: string;
  calendarEdition: {
    id: string;
    name: string;
    code: string;
  };
  layout: {
    id: string;
    name: string;
  };
  year: number;
}

interface CalendarConfigurationsResponse {
  configurations: CalendarConfiguration[];
  totalItems: number;
  totalPages: number;
}

interface UseCalendarConfigurationsProps {
  itemsPerPage?: number;
}

export function useCalendarConfigurations({
  itemsPerPage = 10,
}: UseCalendarConfigurationsProps = {}) {
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<CalendarConfigurationsResponse>({
    queryKey: ["calendar-configurations", { search, page }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        search,
        page: page.toString(),
      });
      console.log("starting fetch");
      const response = await fetch(
        `/api/calendar-configurations?${searchParams}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch calendar configurations");
      }
      console.log("fetch successful");
      return response.json();
    },
  });

  const deleteConfiguration = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/calendar-configurations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete configuration");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-configurations"] });
      toast.success("Configuration deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteConfiguration.mutateAsync(id);
      return true;
    } catch (error) {
      console.error("Failed to delete configuration:", error);
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedRows.map((id) => deleteConfiguration.mutateAsync(id))
      );
      setSelectedRows([]);
      return true;
    } catch (error) {
      console.error("Failed to delete selected configurations:", error);
      return false;
    }
  };

  return {
    configurations: data?.configurations || null,
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
