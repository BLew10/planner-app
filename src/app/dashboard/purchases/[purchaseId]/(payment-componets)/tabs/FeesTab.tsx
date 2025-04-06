"use client";

import { useState } from "react";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

enum PaymentDueOptions {
    OnSpecificDay = "specificDay",
    OnLastDay = "lastDay",
  }

export const FeesTab = () => {
  const paymentOverviewStore = usePaymentOverviewStore();
  const [paymentDueOption, setPaymentDueOption] = useState(
    paymentOverviewStore.paymentOverview?.paymentOnLastDay
      ? PaymentDueOptions.OnLastDay
      : PaymentDueOptions.OnSpecificDay
  );

  const handlePaymentDueChange = (value: string) => {
    setPaymentDueOption(value as PaymentDueOptions);
    if (value === PaymentDueOptions.OnLastDay) {
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", true);
      paymentOverviewStore.updateKeyValue("paymentDueOn", null);
    } else {
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", false);
      // Default to 1st of the month if not already set
      if (!paymentOverviewStore.paymentOverview?.paymentDueOn) {
        paymentOverviewStore.updateKeyValue("paymentDueOn", 1);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Due Dates & Late Fees</CardTitle>
        <CardDescription>
          Set payment due dates and configure late fee options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label className="text-base font-medium">Payment Due Date</Label>
          <RadioGroup
            value={paymentDueOption}
            onValueChange={handlePaymentDueChange}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={PaymentDueOptions.OnSpecificDay}
                id="specific-day"
              />
              <div className="flex items-center gap-2">
                <Label htmlFor="specific-day" className="cursor-pointer">
                  On the
                </Label>
                <Select
                  value={
                    paymentOverviewStore.paymentOverview?.paymentDueOn?.toString() ||
                    ""
                  }
                  onValueChange={(value) => {
                    paymentOverviewStore.updateKeyValue(
                      "paymentDueOn",
                      Number(value)
                    );
                    paymentOverviewStore.updateKeyValue(
                      "paymentOnLastDay",
                      false
                    );
                    setPaymentDueOption(PaymentDueOptions.OnSpecificDay);
                  }}
                  disabled={
                    paymentDueOption !== PaymentDueOptions.OnSpecificDay
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">of each month</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={PaymentDueOptions.OnLastDay}
                id="last-day"
              />
              <Label htmlFor="last-day" className="cursor-pointer">
                Last day of each month
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <Label className="text-base font-medium">Late Fee</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <Label htmlFor="lateFee">Fee Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lateFee"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  placeholder="0.00"
                  value={
                    paymentOverviewStore.paymentOverview?.lateFee?.toString() ||
                    ""
                  }
                  onChange={(e) => {
                    paymentOverviewStore.updateKeyValue(
                      "lateFee",
                      Number(e.target.value)
                    );
                    paymentOverviewStore.updateKeyValue("lateFeePercent", null);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium text-muted-foreground">OR</span>
              <div className="flex-1 space-y-2">
                <Label htmlFor="lateFeePercent">Fee Percentage</Label>
                <div className="relative flex items-center">
                  <Input
                    id="lateFeePercent"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pr-8"
                    value={
                      paymentOverviewStore.paymentOverview?.lateFeePercent?.toString() ||
                      ""
                    }
                    onChange={(e) => {
                      paymentOverviewStore.updateKeyValue(
                        "lateFeePercent",
                        Number(e.target.value)
                      );
                      paymentOverviewStore.updateKeyValue("lateFee", null);
                    }}
                  />
                  <span className="absolute right-3 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
