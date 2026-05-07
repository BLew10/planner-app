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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEvent } from "@/hooks/event/useEvent";
import { MultiSelect } from "@/components/ui/multi-select";
import { useRouter } from "next/navigation";
import { CircleHelp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_YEARS } from "@/lib/constants";
import {
  EVENT_MONTH_SELECTOR_OPTIONS,
  EVENT_ORDINAL_OPTIONS,
  EVENT_SCHEDULE_TYPES,
  EVENT_WEEKDAY_OPTIONS,
  getMonthDay,
} from "@/lib/events/recurrence";

const SCHEDULE_HELP = [
  {
    title: "Single-Day Event",
    description:
      "Matches the screenshot's Single-Day Event option. Use it for anything that begins and ends on one date.",
    example: "Example: July 4, 2026, or a birthday every July 4.",
    accent: "bg-emerald-50 border-emerald-200",
    icon: "bg-emerald-500 text-white",
    tag: "One date",
  },
  {
    title: "Every day between start and end",
    description:
      "Matches the repeating option: Every day between the start date and end date. The event appears on each date in that range.",
    example: "Example: A festival from May 10 through May 12.",
    accent: "bg-sky-50 border-sky-200",
    icon: "bg-sky-500 text-white",
    tag: "Every day",
  },
  {
    title: "On selected day(s) of each month",
    description:
      "Matches the repeating option: On the selected day position of each month. The dropdown supports every, every other, second and fourth, first/third/fifth, first, second, third, fourth, and last.",
    example: "Example: the first day of each month, or the second and fourth day of each month.",
    accent: "bg-amber-50 border-amber-200",
    icon: "bg-amber-500 text-white",
    tag: "Monthly",
  },
  {
    title: "On selected weekday of selected months",
    description:
      "Matches the repeating option: On the selected ordinal weekday of every, even, or odd months.",
    example: "Example: The second and fourth Monday of every month, or the first Friday of odd months.",
    accent: "bg-fuchsia-50 border-fuchsia-200",
    icon: "bg-fuchsia-500 text-white",
    tag: "Pattern",
  },
];

const SCHEDULE_DESCRIPTIONS: Record<string, string> = {
  SINGLE_DAY:
    "One date only. Turn on Yearly Event if it should repeat on the same month/day every year.",
  DAILY_RANGE:
    "Repeats every day between the selected start and end dates, inclusive.",
  MONTHLY_DAY:
    "Repeats on selected day-of-month positions inside each month between the start and end dates.",
  MONTHLY_ORDINAL_WEEKDAY:
    "Repeats on selected weekday positions for every, even, or odd months between the start and end dates.",
};

const formSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().optional(),
    calendarEditionIds: z
      .array(z.string())
      .min(1, { message: "At least one calendar edition is required" }),
    scheduleType: z
      .enum([
        "SINGLE_DAY",
        "DAILY_RANGE",
        "MONTHLY_DAY",
        "MONTHLY_ORDINAL_WEEKDAY",
      ])
      .default("SINGLE_DAY"),
    startsOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Start date must be in YYYY-MM-DD format",
      })
      .optional()
      .or(z.literal("")),
    endsOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "End date must be in YYYY-MM-DD format",
      })
      .optional()
      .or(z.literal("")),
    monthlyOrdinal: z
      .enum([
        "EVERY",
        "EVERY_OTHER",
        "SECOND_AND_FOURTH",
        "FIRST_THIRD_AND_FIFTH",
        "FIRST",
        "SECOND",
        "THIRD",
        "FOURTH",
        "LAST",
      ])
      .optional(),
    monthlyWeekday: z
      .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ])
      .optional(),
    monthlyMonthSelector: z.enum(["EVERY", "EVEN", "ODD"]).optional(),
    isMultiDay: z.boolean().default(false),
    date: z
      .string()
      .regex(/^\d{2}-\d{2}$/, { message: "Date must be in MM-DD format" })
      .optional()
      .or(z.literal("")),
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
    if (!data.startsOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date is required",
        path: ["startsOn"],
      });
    }

    const requiresEndDate = data.scheduleType !== "SINGLE_DAY";
    if (requiresEndDate && !data.endsOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required",
        path: ["endsOn"],
      });
    }

    if (
      data.startsOn &&
      data.endsOn &&
      data.scheduleType !== "SINGLE_DAY" &&
      data.endsOn < data.startsOn
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endsOn"],
      });
    }

    if (
      (data.scheduleType === "MONTHLY_DAY" ||
        data.scheduleType === "MONTHLY_ORDINAL_WEEKDAY") &&
      !data.monthlyOrdinal
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Repeat option is required",
        path: ["monthlyOrdinal"],
      });
    }

    if (data.scheduleType === "MONTHLY_ORDINAL_WEEKDAY") {
      if (!data.monthlyWeekday) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Weekday is required",
          path: ["monthlyWeekday"],
        });
      }

      if (!data.monthlyMonthSelector) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Month selector is required",
          path: ["monthlyMonthSelector"],
        });
      }
    }

    // Year validation
    if (
      data.scheduleType === "SINGLE_DAY" &&
      !data.isYearly &&
      !data.year
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year is required for non-yearly events",
        path: ["year"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  id: undefined,
  name: "",
  description: "",
  calendarEditionIds: [],
  scheduleType: "SINGLE_DAY",
  startsOn: "",
  endsOn: "",
  monthlyOrdinal: "FIRST",
  monthlyWeekday: "MONDAY",
  monthlyMonthSelector: "EVERY",
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
  const watchScheduleType = form.watch("scheduleType");
  const requiresEndDate = watchScheduleType !== "SINGLE_DAY";
  const isMonthlySchedule =
    watchScheduleType === "MONTHLY_DAY" ||
    watchScheduleType === "MONTHLY_ORDINAL_WEEKDAY";

  // Clear year field when yearly is checked
  useEffect(() => {
    if (watchIsYearly || isMonthlySchedule) {
      form.setValue("year", "");
    }
  }, [watchIsYearly, isMonthlySchedule, form]);

  // Clear end date field when the selected schedule does not use a range.
  useEffect(() => {
    if (!requiresEndDate) {
      form.setValue("endsOn", "");
    }
  }, [requiresEndDate, form]);

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
        scheduleType: event.scheduleType || "SINGLE_DAY",
        startsOn:
          event.startsOn ||
          (event.date
            ? `${event.year ?? new Date().getFullYear()}-${event.date}`
            : ""),
        endsOn:
          event.endsOn ||
          (event.endDate
            ? `${event.year ?? new Date().getFullYear()}-${event.endDate}`
            : ""),
        monthlyOrdinal: event.monthlyOrdinal || "FIRST",
        monthlyWeekday: event.monthlyWeekday || "MONDAY",
        monthlyMonthSelector: event.monthlyMonthSelector || "EVERY",
      });
    }
  }, [event, form]);

  const onSubmit = async (data: FormValues) => {
    console.log("Form data:", data);
    try {
      const yearly =
        data.scheduleType === "MONTHLY_DAY" ||
        data.scheduleType === "MONTHLY_ORDINAL_WEEKDAY"
          ? true
          : data.isYearly;

      const formattedData = {
        ...data,
        date: data.startsOn ? getMonthDay(data.startsOn) : data.date || "",
        isYearly: yearly,
        isMultiDay: data.scheduleType === "DAILY_RANGE",
        endDate:
          data.scheduleType === "DAILY_RANGE" && data.endsOn
            ? getMonthDay(data.endsOn)
            : undefined,
        endsOn: data.scheduleType !== "SINGLE_DAY" ? data.endsOn : undefined,
        year:
          yearly || !data.startsOn
            ? undefined
            : parseInt(data.startsOn.slice(0, 4), 10),
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
                    <FormDescription>
                      {SCHEDULE_DESCRIPTIONS[field.value]}
                    </FormDescription>
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

              <FormField
                control={form.control}
                name="scheduleType"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel required>Schedule</FormLabel>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            aria-label="Open schedule help"
                          >
                            <CircleHelp className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl overflow-hidden p-0">
                          <DialogHeader className="bg-gradient-to-r from-cyan-600 via-blue-600 to-fuchsia-600 px-6 py-5 text-white">
                            <DialogTitle className="text-white">
                              Schedule Types
                            </DialogTitle>
                            <DialogDescription className="text-white/85">
                              Choose the pattern that matches how the event
                              should appear on calendar exports.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-3 p-6 sm:grid-cols-2">
                            {SCHEDULE_HELP.map((item) => (
                              <div
                                key={item.title}
                                className={`rounded-lg border p-4 shadow-sm ${item.accent}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-bold ${item.icon}`}
                                  >
                                    {item.title.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="text-sm font-semibold text-slate-950">
                                        {item.title}
                                      </h3>
                                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-700">
                                        {item.tag}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-5 text-slate-700">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {item.example}
                                </p>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("isMultiDay", value === "DAILY_RANGE");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_SCHEDULE_TYPES.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchScheduleType === "SINGLE_DAY" && (
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
              )}

              {watchScheduleType === "SINGLE_DAY" && !watchIsYearly && (
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
                name="startsOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {requiresEndDate ? "Start Date" : "Date"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchScheduleType === "SINGLE_DAY"
                        ? "The event date. For yearly events, only the month and day are reused."
                        : "The first date this repeating pattern can appear."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {requiresEndDate && (
                <FormField
                  control={form.control}
                  name="endsOn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        The final date this repeating pattern can appear.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isMonthlySchedule && (
                <FormField
                  control={form.control}
                  name="monthlyOrdinal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Repeat On</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select repeat option" />
                          </SelectTrigger>
                          <SelectContent>
                            {EVENT_ORDINAL_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        For monthly day schedules, this means day-of-month
                        positions. For monthly weekday schedules, this means
                        weekday occurrence positions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchScheduleType === "MONTHLY_ORDINAL_WEEKDAY" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyWeekday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Weekday</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select weekday" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_WEEKDAY_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyMonthSelector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Months</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select months" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_MONTH_SELECTOR_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
