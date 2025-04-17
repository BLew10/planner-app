import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Configuration {
  id: string;
  calendarEdition: {
    id: string;
    name: string;
    code: string;
  };
  layout: {
    id: string;
    name: string;
    adPlacements: {
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      position: string;
      advertisement: {
        id: string;
        name: string;
      };
    }[];
  };
  year: number;
}

interface ConfigurationsResponse {
  configurations: Configuration[];
  totalItems: number;
  totalPages: number;
}

export function useConfigurations() {
  const { data, isLoading } = useQuery<ConfigurationsResponse>({
    queryKey: ["configurations"],
    queryFn: async () => {
      const response = await axios.get("/api/calendar-configurations");
      return response.data;
    },
  });

  return { configurations: data?.configurations || [], isLoading };
} 