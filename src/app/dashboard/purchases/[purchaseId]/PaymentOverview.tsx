"use client";
import React from "react";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { MONTHS } from "@/lib/constants";

// Shadcn Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  DollarSign,
  CreditCard,
  Calendar,
  ArrowDown,
  ArrowUp,
  Receipt,
  Clock,
  AlertCircle,
  CheckCircle2,
  Tag,
  Landmark,
  PercentIcon,
} from "lucide-react";

const PaymentOverview = () => {
  const paymentOverviewStore = usePaymentOverviewStore();
  const paymentsByYear = paymentOverviewStore.organziePaymentsByYear();
  const years = Object.keys(paymentsByYear);

  // Format currency
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payment Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Summary of all payment details and scheduled payments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Left column - Main payment info */}
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">Total Sale</span>
                  </div>
                  <span className="text-xl font-bold">
                    {formatCurrency(
                      paymentOverviewStore.paymentOverview?.totalSale
                    )}
                  </span>
                </div>

                {/* Discounts & Deductions */}
                {[
                  {
                    key: "additionalDiscount1",
                    label: "Additional Discount 1",
                    icon: <Tag className="h-4 w-4" />,
                  },
                  {
                    key: "additionalDiscount2",
                    label: "Additional Discount 2",
                    icon: <Tag className="h-4 w-4" />,
                  },
                  {
                    key: "additionalSales1",
                    label: "Additional Sales 1",
                    icon: <ArrowUp className="h-4 w-4" />,
                  },
                  {
                    key: "additionalSales2",
                    label: "Additional Sales 2",
                    icon: <ArrowUp className="h-4 w-4" />,
                  },
                  {
                    key: "trade",
                    label: "Trade",
                    icon: <ArrowDown className="h-4 w-4" />,
                  },
                  {
                    key: "earlyPaymentDiscount",
                    label: "Early Payment Discount",
                    icon: <Clock className="h-4 w-4" />,
                  },
                  {
                    key: "earlyPaymentDiscountPercent",
                    label: "Early Payment Discount %",
                    icon: <PercentIcon className="h-4 w-4" />,
                  },
                  {
                    key: "amountPrepaid",
                    label: "Amount Prepaid",
                    icon: <CheckCircle2 className="h-4 w-4" />,
                  },
                ].map((item) => {
                  const value =
                    paymentOverviewStore.paymentOverview?.[
                      item.key as keyof typeof paymentOverviewStore.paymentOverview
                    ];
                  if (!value) return null;

                  return (
                    <div
                      key={item.key}
                      className="flex justify-between items-center py-1.5 border-b border-dashed"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="font-medium text-destructive"
                      >
                        -{formatCurrency(value as number)}
                      </Badge>
                    </div>
                  );
                })}

                {/* Net amount */}
                <div className="flex justify-between items-center pt-2 mt-2 border-t-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">Net</span>
                  </div>
                  <Badge className="text-lg py-1 px-3">
                    {formatCurrency(paymentOverviewStore.paymentOverview?.net)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {/* Right column - Payment method info */}
                {paymentOverviewStore.paymentOverview?.paymentMethod && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>Payment Method</span>
                    </div>
                    <span className="font-medium">
                      {paymentOverviewStore.paymentOverview?.paymentMethod}
                    </span>
                  </div>
                )}

                {paymentOverviewStore.paymentOverview?.checkNumber && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Landmark className="h-4 w-4" />
                      <span>Check Number</span>
                    </div>
                    <span className="font-medium">
                      {paymentOverviewStore.paymentOverview?.checkNumber}
                    </span>
                  </div>
                )}

                {paymentOverviewStore.paymentOverview?.lateFee && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>Late Fee</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(
                        paymentOverviewStore.paymentOverview?.lateFee
                      )}
                    </span>
                  </div>
                )}

                {paymentOverviewStore.paymentOverview?.lateFeePercent && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <PercentIcon className="h-4 w-4" />
                      <span>Late Fee Percent</span>
                    </div>
                    <span className="font-medium">
                      {paymentOverviewStore.paymentOverview?.lateFeePercent}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {years.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Schedule</CardTitle>
              <CardDescription>
                Payments organized by year and month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={years[0]} className="w-full">
                <TabsList className="mb-4">
                  {years.map((year) => (
                    <TabsTrigger
                      key={year}
                      value={year}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      {year}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {years.map((year) => (
                  <TabsContent key={year} value={year} className="mt-0">
                    <ScrollArea className="h-[300px] rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Month</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentsByYear[year as any].map((payment) => (
                            <TableRow key={formatDateToString(payment.dueDate)}>
                              <TableCell className="font-medium">
                                {MONTHS[payment.month - 1]}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  {formatCurrency(Number(payment.amount))}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {formatDateToString(payment.dueDate)}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentOverview;
