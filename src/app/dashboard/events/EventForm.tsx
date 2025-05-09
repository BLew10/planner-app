"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/hooks/event/useEvent";
import { MultiSelect } from "@/components/ui/multi-select";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_YEARS } from "@/lib/constants";

const formSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().optional(),
    calendarEditionIds: z
      .array(z.string())
      .min(1, { message: "At least one calendar edition is required" }),
    isMultiDay: z.boolean().default(false),
    date: z
      .string()
      .regex(/^\d{2}-\d{2}$/, { message: "Date must be in MM-DD format" }),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    year: z.string().optional(),
    endDate: z
      .string()
      .regex(/^\d{2}-\d{2}$/, { message: "End date must be in MM-DD format" })
      .optional()
      .or(z.literal("")),
    isYearly: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // Year validation
    if (!data.isYearly && !data.year) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year is required for non-yearly events",
        path: ["year"],
      });
    }

    // End date validation for multi-day events
    if (data.isMultiDay && !data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required for multi-day events",
        path: ["endDate"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  id: undefined,
  name: "",
  description: "",
  calendarEditionIds: [],
  isMultiDay: false,
  date: "",
  endDate: "",
  startTime: "",
  endTime: "",
  year: new Date().getFullYear().toString(),
  isYearly: false,
};

interface CalendarEventFormProps {
  id: string | null;
}

export default function CalendarEventForm({ id }: CalendarEventFormProps) {
  const { saveEvent, isLoading, event, calendarEditions } = useEvent({
    id: id || "",
  });
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const watchIsYearly = form.watch("isYearly");
  const watchIsMultiDay = form.watch("isMultiDay");

  // Clear year field when yearly is checked
  useEffect(() => {
    if (watchIsYearly) {
      form.setValue("year", "");
    }
  }, [watchIsYearly, form]);

  // Clear endDate field when multi-day is unchecked
  useEffect(() => {
    if (!watchIsMultiDay) {
      form.setValue("endDate", "");
    }
  }, [watchIsMultiDay, form]);

  useEffect(() => {
    if (event) {
      form.reset({
        id: event.id || undefined,
        name: event.name || "",
        description: event.description || "",
        date: event.date || "",
        isYearly: event.isYearly || false,
        year: event.year ? event.year.toString() : undefined,
        calendarEditionIds: event.calendarEditionIds || [],
        isMultiDay: event.isMultiDay || false,
        endDate: event.endDate || "",
        startTime: event.startTime || "",
        endTime: event.endTime || "",
      });
    }
  }, [event, form]);

  const onSubmit = async (data: FormValues) => {
    console.log("Form data:", data);
    try {
      // If not multi-day, ensure endDate is undefined to avoid validation issues
      const formattedData = {
        ...data,
        endDate: data.isMultiDay ? data.endDate : undefined,
        year: data.year ? parseInt(data.year, 10) : undefined,
      };

      const success = await saveEvent(formattedData);
      if (success) {
        router.push("/dashboard/events");
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  useEffect(() => {
    console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto my-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            <Skeleton className="h-8 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {id ? "Edit" : "Add"} Calendar Event
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Event Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description of the event"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="calendarEditionIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Calendar Editions</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={
                          calendarEditions?.map((calendar) => ({
                            label: calendar.name || "",
                            value: calendar.id || "",
                          })) || []
                        }
                        defaultValue={field.value || []}
                        onValueChange={field.onChange}
                        placeholder="Select calendar editions"
                      />
                    </FormControl>
                    <FormDescription>
                      Select one or more calendar editions for this event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isYearly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Yearly Event
                        </FormLabel>
                        <FormDescription>
                          If enabled, this event occurs every year on the same
                          date
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isMultiDay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Multi-Day Event
                        </FormLabel>
                        <FormDescription>
                          If enabled, this event spans multiple days
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {!watchIsYearly && (
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Year</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_YEARS.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Select the specific year for this one-time event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {watchIsMultiDay ? "Start Date (MM-DD)" : "Date (MM-DD)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12-25"
                        {...field}
                        onChange={(e) => {
                          // Format as MM-DD
                          let value = e.target.value.replace(/[^0-9-]/g, "");

                          // Auto-add the dash
                          if (value.length === 2 && !value.includes("-")) {
                            value = value + "-";
                          }

                          // Limit to 5 characters (MM-DD)
                          if (value.length <= 5) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter date in MM-DD format (e.g., 12-25 for December 25)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchIsMultiDay && (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>End Date (MM-DD)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12-26"
                          {...field}
                          onChange={(e) => {
                            // Format as MM-DD
                            let value = e.target.value.replace(/[^0-9-]/g, "");

                            // Auto-add the dash
                            if (value.length === 2 && !value.includes("-")) {
                              value = value + "-";
                            }

                            // Limit to 5 characters (MM-DD)
                            if (value.length <= 5) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter end date in MM-DD format
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input placeholder="10:00 AM" {...field} />
                      </FormControl>
                      <FormDescription>Optional start time</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input placeholder="2:00 PM" {...field} />
                      </FormControl>
                      <FormDescription>Optional end time</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/events")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
