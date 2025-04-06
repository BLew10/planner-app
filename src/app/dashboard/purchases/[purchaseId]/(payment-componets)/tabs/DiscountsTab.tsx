"use client";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DollarSign } from "lucide-react";

export const DiscountsTab = () => {
  const paymentOverviewStore = usePaymentOverviewStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discounts & Additional Sales</CardTitle>
        <CardDescription>
          Apply additional discounts or add extra sales to this purchase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="additionalDiscount1">
              Additional Discount (Option 1)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="additionalDiscount1"
                type="number"
                step="0.01"
                className="pl-8"
                placeholder="0.00"
                value={
                  paymentOverviewStore.paymentOverview?.additionalDiscount1?.toString() ||
                  ""
                }
                onChange={(e) =>
                  paymentOverviewStore.updateKeyValue(
                    "additionalDiscount1",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalDiscount2">
              Additional Discount (Option 2)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="additionalDiscount2"
                type="number"
                step="0.01"
                className="pl-8"
                placeholder="0.00"
                value={
                  paymentOverviewStore.paymentOverview?.additionalDiscount2?.toString() ||
                  ""
                }
                onChange={(e) =>
                  paymentOverviewStore.updateKeyValue(
                    "additionalDiscount2",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalSales1">
              Additional Sales (Option 1)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="additionalSales1"
                type="number"
                step="0.01"
                className="pl-8"
                placeholder="0.00"
                value={
                  paymentOverviewStore.paymentOverview?.additionalSales1?.toString() ||
                  ""
                }
                onChange={(e) =>
                  paymentOverviewStore.updateKeyValue(
                    "additionalSales1",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalSales2">
              Additional Sales (Option 2)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="additionalSales2"
                type="number"
                step="0.01"
                className="pl-8"
                placeholder="0.00"
                value={
                  paymentOverviewStore.paymentOverview?.additionalSales2?.toString() ||
                  ""
                }
                onChange={(e) =>
                  paymentOverviewStore.updateKeyValue(
                    "additionalSales2",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade">Trade Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="trade"
                type="number"
                step="0.01"
                className="pl-8"
                placeholder="0.00"
                value={
                  paymentOverviewStore.paymentOverview?.trade?.toString() || ""
                }
                onChange={(e) =>
                  paymentOverviewStore.updateKeyValue(
                    "trade",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <h3 className="text-base font-medium">Early Payment Discount</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <Label htmlFor="earlyPaymentDiscount">Discount Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="earlyPaymentDiscount"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  placeholder="0.00"
                  value={
                    paymentOverviewStore.paymentOverview?.earlyPaymentDiscount?.toString() ||
                    ""
                  }
                  onChange={(e) => {
                    paymentOverviewStore.updateKeyValue(
                      "earlyPaymentDiscount",
                      Number(e.target.value)
                    );
                    paymentOverviewStore.updateKeyValue(
                      "earlyPaymentDiscountPercent",
                      null
                    );
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium text-muted-foreground">OR</span>
              <div className="flex-1 space-y-2">
                <Label htmlFor="earlyPaymentDiscountPercent">
                  Discount Percentage
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="earlyPaymentDiscountPercent"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pr-8"
                    value={
                      paymentOverviewStore.paymentOverview?.earlyPaymentDiscountPercent?.toString() ||
                      ""
                    }
                    onChange={(e) => {
                      paymentOverviewStore.updateKeyValue(
                        "earlyPaymentDiscountPercent",
                        Number(e.target.value)
                      );
                      paymentOverviewStore.updateKeyValue(
                        "earlyPaymentDiscount",
                        null
                      );
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
