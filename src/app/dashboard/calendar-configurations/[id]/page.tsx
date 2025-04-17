"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ConfigurationForm } from "../ConfigurationForm";

interface Configuration {
  id: string;
  calendarEditionId: string;
  layoutId: string;
  year: number;
}

export default function EditConfigurationPage() {
  const params = useParams();
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConfiguration() {
      try {
        const response = await fetch(`/api/calendar-configurations/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch configuration");
        }
        const data = await response.json();
        setConfiguration(data);
      } catch (error) {
        console.error("Error fetching configuration:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchConfiguration();
    }
  }, [params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!configuration) {
    return <div>Configuration not found</div>;
  }

  return (
    <div className="container mx-auto py-20 w-[50%]">
      <ConfigurationForm
        initialData={{
          id: configuration.id,
          calendarEditionId: configuration.calendarEditionId,
          layoutId: configuration.layoutId,
          year: configuration.year,
        }}
      />
    </div>
  );
} 