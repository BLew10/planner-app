"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/shadcn/use-toast";

import { getPaymentOverviewById } from "@/lib/data/paymentOverview";
import { getPurchaseById } from "@/lib/data/purchase";
import {
  upsertPayment,
  UpsertPaymentData,
} from "@/actions/payment/upsertPayment";
import { PaymentModel } from "@/lib/models/payment";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import { formatDateToString } from "@/lib/helpers/formatDateToString";

// Form schema for validation
const formSchema = z.object({
  amount: z.number().positive().nullable(),
  paymentMethod: z.string(),
  paymentDate: z.string(),
  checkNumber: z.string(),
});

interface PaymentFormProps {
  payment: Partial<PaymentModel> | null;
}

const PaymentDetails = ({ payment }: PaymentFormProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOverview, setPaymentOverview] =
    useState<Partial<PaymentOverviewModel> | null>(null);
  const [purchaseOverview, setPurchaseOverview] =
    useState<Partial<PurchaseOverviewModel> | null>(null);

  // Set up form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: Number(payment?.amount) || null,
      paymentMethod: payment?.paymentMethod || "",
      paymentDate: payment?.paymentDate || format(new Date(), "yyyy-MM-dd"),
      checkNumber: payment?.checkNumber || "",
    },
  });

  useEffect(() => {
    const paymentOverviewId = searchParams.get("paymentOverviewId");
    const purchaseId = searchParams.get("purchaseId");

    if (paymentOverviewId && purchaseId) {
      const fetchPaymentOverview = async () => {
        const paymentOverview = await getPaymentOverviewById(paymentOverviewId);
        setPaymentOverview(paymentOverview);
      };
      const fetchPurchaseOverview = async () => {
        const purchaseOverview = await getPurchaseById(purchaseId);
        setPurchaseOverview(purchaseOverview);
      };
      fetchPaymentOverview();
      fetchPurchaseOverview();
    }

    if (payment) {
      form.reset({
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod || "",
        paymentDate: payment.paymentDate || format(new Date(), "yyyy-MM-dd"),
        checkNumber: payment.checkNumber || "",
      });
    }
  }, [searchParams, payment, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    const data: UpsertPaymentData = {
      id: payment?.id || "",
      amount: Number(values.amount),
      paymentMethod: values.paymentMethod,
      paymentDate: values.paymentDate,
      checkNumber: values.checkNumber,
      purchaseId: purchaseOverview?.id || "",
      paymentOverviewId: paymentOverview?.id || "",
      contactId: purchaseOverview?.contact?.id || "",
    };

    const success = await upsertPayment(data);

    if (success) {
      toast({
        title: "Payment updated successfully",
        variant: "default",
      });
      router.push("/dashboard/payments");
    } else {
      toast({
        title: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      value={field.value === null ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Credit Memo">Credit Memo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("paymentMethod") === "Check" && (
              <FormField
                control={form.control}
                name="checkNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(formatDateToString(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={form.handleSubmit(onSubmit)}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentDetails;
