"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarEdition } from "@/hooks/calendar-edition/useCalendarEdition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarEventsList from "../../events/EventsList";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(2, "Code must be 2 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  name: "",
  code: "",
};

interface CalendarFormProps {
  id: string | null;
}

export default function CalendarForm({ id }: CalendarFormProps) {
  const { saveCalendarEdition, isLoading, calendarEdition } =
    useCalendarEdition({ id: id || "" });
    
  const [activeTab, setActiveTab] = useState("details");
    
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (calendarEdition) {
      form.reset({
        name: calendarEdition.name,
        code: calendarEdition.code,
      });
    }
  }, [calendarEdition, form]);

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
              {[...Array(2)].map((_, i) => (
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
          {id ? "Edit" : "Add"} Calendar Edition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            {id && <TabsTrigger value="events">Events</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="details">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(saveCalendarEdition)}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Name</FormLabel>
                        <FormControl>
                          <Input required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Code</FormLabel>
                        <FormControl>
                          <Input
                            required
                            maxLength={2}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {id && (
            <TabsContent value="events">
              <CalendarEventsList calendarId={id} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
