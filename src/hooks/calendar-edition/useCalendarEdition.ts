import { useState, useEffect } from "react";
import { getCalendarById } from "@/lib/data/calendarEdition";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/shadcn/use-toast";
import upsertCalendarEdition from "@/actions/calendar-editions/upsertCalendarEdition";

interface CalendarEdition {
  name: string;
  code: string;
}

interface UseCalendarEditionProps {
  id: string;
}

export function useCalendarEdition({ id }: UseCalendarEditionProps) {
  const [calendarEdition, setCalendarEdition] = useState<CalendarEdition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCalendarEdition() {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await getCalendarById(id);
        if (data) {
          setCalendarEdition({
            name: data.name || "",
            code: data.code || "",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch calendar edition",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchCalendarEdition();
    }
  }, [id, toast]);

  const saveCalendarEdition = async (data: CalendarEdition) => {
    setIsLoading(true);
    try {
      const success = await upsertCalendarEdition(data, id || null);
      if (success) {
        router.push("/dashboard/calendar-editions");
      } else {
        toast({
          title: "Error",
          description: "Failed to save calendar edition",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    calendarEdition,
    isLoading,
    saveCalendarEdition,
  };
}
