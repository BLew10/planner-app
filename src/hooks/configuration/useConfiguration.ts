import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/shadcn/use-toast";

interface ConfigurationData {
  calendarEditionId: string;
  layoutId: string;
  year: number;
}

interface UseConfigurationProps {
  initialData?: {
    id: string;
    calendarEditionId: string;
    layoutId: string;
    year: number;
  };
}

export function useConfiguration({ initialData }: UseConfigurationProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedEdition, setSelectedEdition] = useState<string>(
    initialData?.calendarEditionId || ""
  );
  const [selectedLayout, setSelectedLayout] = useState<string>(
    initialData?.layoutId || ""
  );
  const [year, setYear] = useState<string>(
    (initialData?.year || new Date().getFullYear()).toString()
  );

  const saveConfiguration = async () => {
    if (!selectedEdition || !selectedLayout || !year) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await fetch(
        "/api/calendar-configurations" +
          (initialData ? `/${initialData.id}` : "/configure-layout"),
        {
          method: initialData ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calendarEditionId: selectedEdition,
            layoutId: selectedLayout,
            year: parseInt(year),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Handle unique constraint violation
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
          return false;
        }
        throw new Error(data.error || "Failed to save configuration");
      }

      toast({
        title: "Success",
        description: `Configuration ${
          initialData ? "updated" : "created"
        } successfully`,
      });

      router.push("/dashboard/calendar-configurations");
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${
          initialData ? "update" : "create"
        } configuration`,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    selectedEdition,
    setSelectedEdition,
    selectedLayout,
    setSelectedLayout,
    year,
    setYear,
    saveConfiguration,
  };
} 