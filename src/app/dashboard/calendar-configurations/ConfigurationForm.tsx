"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLayoutList } from "@/hooks/layout/useLayoutList";
import { useCalendarEditions } from "@/hooks/calendar-edition/useCalendarEditions";
import { useConfiguration } from "@/hooks/configuration/useConfiguration";

interface ConfigurationFormProps {
  initialData?: {
    id: string;
    calendarEditionId: string;
    layoutId: string;
    year: number;
  };
}

export function ConfigurationForm({ initialData }: ConfigurationFormProps) {
  const router = useRouter();
  const { layouts } = useLayoutList({});
  const { calendarEditions, isLoading } = useCalendarEditions({
    itemsPerPage: 100,
  });
  const {
    selectedEdition,
    setSelectedEdition,
    selectedLayout,
    setSelectedLayout,
    year,
    setYear,
    saveConfiguration,
  } = useConfiguration({ initialData });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveConfiguration();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Configuration" : "Create New Configuration"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Calendar Edition</label>
            <Select value={selectedEdition} onValueChange={setSelectedEdition}>
              <SelectTrigger>
                <SelectValue placeholder="Select a calendar edition" />
              </SelectTrigger>
              <SelectContent>
                {calendarEditions?.map((edition) => (
                  <SelectItem key={edition.id} value={edition.id}>
                    {edition.name} ({edition.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Layout</label>
            <Select value={selectedLayout} onValueChange={setSelectedLayout}>
              <SelectTrigger>
                <SelectValue placeholder="Select a layout" />
              </SelectTrigger>
              <SelectContent>
                {layouts?.map((layout) => (
                  <SelectItem key={layout.id} value={layout.id}>
                    {layout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit">
              {initialData ? "Update Configuration" : "Create Configuration"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/calendar-configurations")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
