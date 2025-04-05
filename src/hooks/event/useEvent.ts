import { useState, useEffect } from "react";
import {
  getEventById,
  getAllCalendarEditions,
} from "@/lib/data/event";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/shadcn/use-toast";
import upsertEvent from "@/actions/events/upsertEvent";
import { CalendarEdition } from "@prisma/client";

interface EventData {
  name: string;
  description?: string;
  date: string;
  isYearly: boolean;
  year?: number | null;
  calendarEditionIds: string[];
  isMultiDay: boolean;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

interface UseEventProps {
  id: string;
}

export function useEvent({ id }: UseEventProps) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [calendarEditions, setCalendarEditions] = useState<
    Partial<CalendarEdition>[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch all calendar editions for the dropdown
        const editions = await getAllCalendarEditions();
        setCalendarEditions(editions || []);

        // If editing, fetch the calendar event
        if (id) {
          const data = await getEventById(id);
          if (data) {
            setEvent({
              name: data.name || "",
              description: data.description || "",
              date: data.date || "",
              isYearly: data.isYearly ?? true,
              year: data.year,
              calendarEditionIds:
                data.calendarEditions?.map((cal) => cal.id).filter((id): id is string => id !== undefined) || [],
              isMultiDay: data.isMultiDay ?? false,
              endDate: data.endDate || "",
              startTime: data.startTime || "",
              endTime: data.endTime || "",
            });
          }
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, toast]);

  const saveEvent = async (data: EventData) => {
    setIsLoading(true);
    try {
      const success = await upsertEvent(data, id || null);
      if (success) {
        toast({
          title: "Success",
          description: `Event ${
            id ? "updated" : "created"
          } successfully`,
        });
        return true;
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calendar event",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    event,
    calendarEditions,
    isLoading,
    saveEvent,
  };
}
