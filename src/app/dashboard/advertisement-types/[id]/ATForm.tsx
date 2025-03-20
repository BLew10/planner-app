"use client";

import React, { useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdType } from "@/hooks/advertisment-type/useAdType";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isDayType: z.boolean(),
  perMonth: z.coerce.number().min(0, "Quantity per month must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  name: "",
  isDayType: false,
  perMonth: 0,
};

interface ATFormProps {
  id: string | null;
}

export default function ATForm({ id }: ATFormProps) {
  const { saveAdType, isLoading, adType } = useAdType({ id: id || "" });
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (adType) {
      form.reset(adType);
    }
  }, [adType, form]);

  useEffect(() => {
    const isDayType = form.watch("isDayType");
    if (isDayType) {
      form.setValue("perMonth", 35);
    }
  }, [form.watch("isDayType")]);

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
              {[...Array(3)].map((_, i) => (
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
          {id ? `Edit ${adType?.name}` : "Add Advertisement Type"}
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          Use this form to either add a new advertisement type or edit an existing one.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          The &quot;Quantity per Month&quot; field indicates the total number of this advertisement type that can be used each month.
          For &quot;Day Type&quot; advertisements, this quantity is automatically set to 35 and cannot be altered, reflecting the fixed availability of day-specific slots within a month.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(saveAdType)} className="space-y-8">
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
                name="isDayType"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!!id}
                      />
                    </FormControl>
                    <FormLabel>Day Type</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Quantity Per Month</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        required
                        min={0}
                        {...field}
                        disabled={form.watch("isDayType")}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
      </CardContent>
    </Card>
  );
}
