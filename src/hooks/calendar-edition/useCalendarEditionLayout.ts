import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Layout } from "@prisma/client";

interface CalendarEditionLayout {
  layout: Layout;
}

export function useCalendarEditionLayout(calendarEditionId?: string, year?: number) {
  const { data: calendarLayout, isLoading } = useQuery<CalendarEditionLayout>({
    queryKey: ["calendarEditionLayout", calendarEditionId, year],
    queryFn: async () => {
      if (!calendarEditionId || !year) return null;
      const response = await axios.get(`/api/calendar-editions/${calendarEditionId}/layouts/${year}`);
      return response.data;
    },
    enabled: !!calendarEditionId && !!year,
  });

  return { calendarLayout, isLoading };
} 