import React, { useEffect, useState } from "react";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import { MONTHS } from "@/lib/constants";
import { ScheduledPayment } from "@/store/paymentOverviewStore";
import { useToast } from "@/hooks/shadcn/use-toast";

// Shadcn Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import { CalendarDays, ArrowRight, DollarSign, Check } from "lucide-react";

const currentYear = new Date().getFullYear();
let upcomingYears = [currentYear, currentYear + 1, currentYear + 2];

interface PaymentScheduleProps {
  onNext: () => void;
}

const PaymentSchedule = ({ onNext }: PaymentScheduleProps) => {
  const paymentStore = usePaymentOverviewStore();
  const { toast } = useToast();
  const [paymentYears, setPaymentYears] = useState<number[] | null>(null);
  const [splitPaymentsEqually, setSplitPaymentsEqually] = useState<boolean>(
    !paymentStore.paymentOverview.splitPaymentsEqually ? false : true
  );

  useEffect(() => {
    let paymentYear = paymentStore.paymentOverview.calendarEditionYear;
    if (paymentYear && !upcomingYears.includes(paymentYear)) {
      const difference = Math.abs(upcomingYears[0] - paymentYear);
      const prevYears = [];
      for (let i = 0; i < difference; i++) {
        prevYears.push(paymentYear + i);
      }
      upcomingYears = [...prevYears, ...upcomingYears];
      setPaymentYears(prevYears);
    } else {
      setPaymentYears(upcomingYears);
    }
  }, [paymentStore.paymentOverview.net]);

  useEffect(() => {
    const payments: ScheduledPayment[] = [];
    if (paymentYears) {
      paymentYears?.forEach((year) => {
        MONTHS.forEach((_, monthIndex) => {
          const dueDate = generateDueDates(year, monthIndex);
          const payment = paymentStore.paymentOverview.scheduledPayments?.find(
            (p) => p.month === monthIndex + 1 && p.year === year && p.checked
          );
          if (paymentStore.paymentOverview.scheduledPayments && payment) {
            payments.push({ ...payment, dueDate, checked: true });
          } else {
            payments.push({
              month: monthIndex + 1,
              year,
              amount: null,
              dueDate,
              checked: false,
            });
          }
        });
      });
      paymentStore.updateKeyValue("scheduledPayments", payments);
    }
    paymentStore.updateKeyValue("splitPaymentsEqually", splitPaymentsEqually);
  }, [paymentYears]);

  function getLastDayOfMonth(year: number, month: number) {
    return new Date(year, month + 1, 0); // Month is 0-indexed, 0 day is the last day of the previous month
  }

  function getSpecificDayOfMonth(year: number, month: number, day: number) {
    const lastDay = getLastDayOfMonth(year, month).getDate();
    return new Date(year, month, Number(day) > lastDay ? lastDay : day);
  }

  /**
   * Generates due dates based on the payment overview configuration.
   */
  function generateDueDates(year: number, month: number) {
    if (paymentStore.paymentOverview.paymentOnLastDay) {
      return getLastDayOfMonth(year, month);
    } else if (paymentStore.paymentOverview.paymentDueOn) {
      return getSpecificDayOfMonth(
        year,
        month,
        paymentStore.paymentOverview.paymentDueOn
      );
    }
    return new Date(year, month, 1); // Default to the first of the month if no settings provided
  }

  const handleSplitPaymentsEquallyChange = (splitEqually: boolean) => {
    setSplitPaymentsEqually(splitEqually);
    const scheduledPayments = paymentStore.paymentOverview.scheduledPayments;
    scheduledPayments?.forEach((payment) => {
      payment.amount = null;
    });
    paymentStore.updateKeyValue("scheduledPayments", scheduledPayments);
    paymentStore.updateKeyValue("splitPaymentsEqually", splitEqually);
  };

  const onSubmit = async () => {
    const totalNet = paymentStore.paymentOverview.net || 0;
    let payments: ScheduledPayment[] | null = [];

    if (splitPaymentsEqually) {
      const checkedScheduledPayments =
        paymentStore.paymentOverview.scheduledPayments?.filter(
          (p) => p.checked
        );
      if (!checkedScheduledPayments || checkedScheduledPayments.length === 0 && paymentStore.paymentOverview.net && paymentStore.paymentOverview.net > 0) {
        return toast({
          title: "Error",
          description: "Please select at least one payment month",
          variant: "destructive",
        });
      }

      const equalAmount =
        Math.round((totalNet / checkedScheduledPayments?.length) * 100) / 100;
      payments = checkedScheduledPayments?.map((payment) => ({
        ...payment,
        amount: equalAmount,
      }));
    } else {
      payments =
        paymentStore.paymentOverview.scheduledPayments?.filter(
          (p) => p.amount !== null && !isNaN(p.amount as number) && p.amount > 0
        ) || null;

      if ((!payments || payments.length === 0) && paymentStore.paymentOverview.net && paymentStore.paymentOverview.net > 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount for at least one month",
          variant: "destructive",
        });
        return;
      }
    }

    // Verify that the total payments equal the net amount
    let totalPaymentsAmount = 0;
    for (const payment of payments) {
      totalPaymentsAmount += Number(payment.amount || 0);
    }

    if (totalPaymentsAmount !== totalNet) {
      const lastPaymentIndex = payments.length - 1;
      const overage = totalPaymentsAmount - totalNet;
      payments[lastPaymentIndex].amount =
        (payments[lastPaymentIndex].amount || 0) - overage; // adds or subtracts from the last payment
      totalPaymentsAmount -= overage; // Recalculate the total after adjustment
    }

    if (totalPaymentsAmount === totalNet) {
      paymentStore.updateKeyValue("scheduledPayments", payments);
      onNext();
    } else {
      toast({
        title: "Error",
        description: "Total payments do not match the net amount",
        variant: "destructive",
      });
    }
  };

  const handleCheckboxChange = (
    month: number,
    year: number,
    isChecked: boolean
  ) => {
    const scheduledPayments = [
      ...(paymentStore.paymentOverview.scheduledPayments || []),
    ];
    const paymentIndex = scheduledPayments.findIndex(
      (p) => p.month === month && p.year === year
    );

    if (paymentIndex !== -1) {
      scheduledPayments[paymentIndex] = {
        ...scheduledPayments[paymentIndex],
        checked: isChecked,
      };
    }

    paymentStore.updateKeyValue("scheduledPayments", scheduledPayments);
  };

  const handleInputChange = (
    month: number,
    year: number,
    amount: number | null
  ) => {
    const scheduledPayments = [
      ...(paymentStore.paymentOverview.scheduledPayments || []),
    ];
    const paymentIndex = scheduledPayments.findIndex(
      (p) => p.month === month && p.year === year
    );

    if (paymentIndex !== -1) {
      scheduledPayments[paymentIndex] = {
        ...scheduledPayments[paymentIndex],
        amount,
      };
      paymentStore.updateKeyValue("scheduledPayments", scheduledPayments);
    }
  };

  if (!paymentYears) return null;

  return (
    <Card className="max-w-5xl mx-auto shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">Payment Schedule</CardTitle>
            <CardDescription>
              Plan how to split the total payment across months
            </CardDescription>
          </div>
          <div className="px-4 py-2 bg-primary/10 rounded-md border border-primary/20 flex items-center">
            <span className="text-sm font-medium mr-2">Total:</span>
            <span className="text-xl font-bold text-primary flex items-center">
              <DollarSign className="h-4 w-4 mr-0.5" />
              {paymentStore.paymentOverview.net?.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <RadioGroup
            value={splitPaymentsEqually ? "equal" : "custom"}
            onValueChange={(value) =>
              handleSplitPaymentsEquallyChange(value === "equal")
            }
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex items-start gap-2">
              <RadioGroupItem value="equal" id="equal" />
              <Label htmlFor="equal" className="font-medium cursor-pointer">
                Split payments equally
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="font-medium cursor-pointer">
                Enter custom monthly amounts
              </Label>
            </div>
          </RadioGroup>

          <Separator />

          <Tabs defaultValue={paymentYears[0].toString()} className="w-full">
            <TabsList className="mb-6 h-auto p-1">
              {paymentYears.map((year) => (
                <TabsTrigger
                  key={year}
                  value={year.toString()}
                  className="flex items-center gap-1.5 px-4 py-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  {year}
                </TabsTrigger>
              ))}
            </TabsList>

            {paymentYears.map((year) => (
              <TabsContent key={year} value={year.toString()} className="mt-0">
                <ScrollArea className="h-[500px] rounded-md border p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                    {MONTHS.map((month, index) => {
                      const payment =
                        paymentStore.paymentOverview.scheduledPayments?.find(
                          (p) => p.month === index + 1 && p.year === year
                        );
                      const isChecked = payment?.checked || false;

                      return (
                        <Card
                          key={`${year}-${month}`}
                          className={`overflow-hidden transition-all duration-150 ${
                            splitPaymentsEqually
                              ? "cursor-pointer hover:border-primary/50"
                              : ""
                          } ${
                            splitPaymentsEqually && isChecked
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => {
                            if (splitPaymentsEqually) {
                              handleCheckboxChange(index + 1, year, !isChecked);
                            }
                          }}
                        >
                          <CardHeader
                            className={`py-3 px-4 ${
                              splitPaymentsEqually && isChecked
                                ? "bg-primary/10"
                                : "bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                {month}
                              </CardTitle>
                              {splitPaymentsEqually && isChecked && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4 pb-3 px-4">
                            {splitPaymentsEqually ? (
                              <div className="text-sm text-muted-foreground">
                                {isChecked
                                  ? "Included in payment plan"
                                  : "Click to include in payment plan"}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label htmlFor={`amount-${year}-${index}`}>
                                  Payment amount
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id={`amount-${year}-${index}`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="pl-8"
                                    value={payment?.amount?.toString() || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index + 1,
                                        year,
                                        e.target.value
                                          ? Number(e.target.value)
                                          : null
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end border-t p-6">
        <Button
          onClick={onSubmit}
          size="lg"
          className="gap-2"
          disabled={
            !paymentStore.paymentOverview.scheduledPayments ||
            paymentStore.paymentOverview.scheduledPayments.length === 0
          }
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentSchedule;
