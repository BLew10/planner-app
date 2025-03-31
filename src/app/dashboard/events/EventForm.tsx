"use client";

import React, { useEffect, useState } from "react";
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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{2}-\d{2}$/, "Date must be in MM-DD format"),
  isYearly: z.boolean(),
  year: z
    .union([z.number().min(2000).max(2100), z.null()])
    .nullable(),
  calendarEditionIds: z
    .array(z.string())
    .min(1, "Select at least one calendar edition"),
}).superRefine((data, ctx) => {
  if (!data.isYearly && data.year === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Year is required for non-yearly events",
      path: ["year"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  name: "",
  description: "",
  date: "",
  isYearly: true,
  year: null,
  calendarEditionIds: [],
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

  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name || "",
        description: event.description || "",
        date: event.date || "",
        isYearly: event.isYearly || true,
        year: event.year || null,
        calendarEditionIds: event.calendarEditionIds || [],
      });
    }
  }, [event, form]);

  const onSubmit = async (data: FormValues) => {
    const success = await saveEvent(data);
    if (success) {
      router.push("/dashboard/events");
    }
  };

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
                        options={calendarEditions?.map(calendar => ({
                          label: calendar.name || "",
                          value: calendar.id || "",
                        })) || []}
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

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Date (MM-DD)</FormLabel>
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

              <FormField
                control={form.control}
                name="isYearly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Yearly Recurring
                      </FormLabel>
                      <FormDescription>
                        If enabled, this event will appear on the same date
                        every year
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

              {!watchIsYearly && (
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2024"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : null
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the specific year for this one-time event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
