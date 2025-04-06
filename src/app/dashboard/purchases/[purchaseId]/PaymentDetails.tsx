"use client";
import React, { useState, useEffect } from "react";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import { usePurchasesStore } from "@/store/purchaseStore";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";

// Shadcn components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  ArrowRight,
  DollarSign,
  Wallet,
  Receipt,
  Percent,
} from "lucide-react";

enum PaymentDueOptions {
  OnSpecificDay = "OnSpecificDay",
  OnLastDay = "OnLastDay",
}

interface PaymentDetailsProps {
  onNext: () => void;
  paymentOverview: Partial<PaymentOverviewModel> | null;
}

const PaymentDetails = ({ onNext, paymentOverview }: PaymentDetailsProps) => {
  const paymentOverviewStore = usePaymentOverviewStore();
  const purchaseStore = usePurchasesStore();
  const [paymentDueOption, setPaymentDueOption] = useState(
    PaymentDueOptions.OnSpecificDay
  );

  useEffect(() => {
    if (paymentOverviewStore.paymentOverview.paymentDueOn) {
      setPaymentDueOption(PaymentDueOptions.OnSpecificDay);
      paymentOverviewStore.updateKeyValue(
        "paymentDueOn",
        paymentOverviewStore.paymentOverview.paymentDueOn
      );
    } else {
      setPaymentDueOption(PaymentDueOptions.OnLastDay);
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", true);
      paymentOverviewStore.updateKeyValue("paymentDueOn", null);
    }

    paymentOverviewStore.updateKeyValue("totalSale", purchaseStore.total);
    if (paymentOverview) {
      // Initialize all values from existing payment overview
      paymentOverviewStore.updateKeyValue("id", paymentOverview.id);
      paymentOverviewStore.updateKeyValue(
        "additionalDiscount1",
        paymentOverview.additionalDiscount1
      );
      paymentOverviewStore.updateKeyValue(
        "additionalDiscount2",
        paymentOverview.additionalDiscount2
      );
      paymentOverviewStore.updateKeyValue(
        "additionalSales1",
        paymentOverview.additionalSales1
      );
      paymentOverviewStore.updateKeyValue(
        "additionalSales2",
        paymentOverview.additionalSales2
      );

      if (paymentOverview.paymentDueOn) {
        paymentOverviewStore.updateKeyValue(
          "paymentDueOn",
          paymentOverview.paymentDueOn
        );
        paymentOverviewStore.updateKeyValue("paymentOnLastDay", false);
      } else {
        paymentOverviewStore.updateKeyValue("paymentDueOn", null);
        paymentOverviewStore.updateKeyValue("paymentOnLastDay", true);
      }

      paymentOverviewStore.updateKeyValue("lateFee", paymentOverview.lateFee);
      paymentOverviewStore.updateKeyValue(
        "lateFeePercent",
        paymentOverview.lateFeePercent
      );

      const prePaidPayment = paymentOverview.payments?.find(
        (p) => p.wasPrepaid
      );
      if (prePaidPayment) {
        paymentOverviewStore.updateKeyValue(
          "paymentMethod",
          prePaidPayment?.paymentMethod
        );
        paymentOverviewStore.updateKeyValue(
          "checkNumber",
          prePaidPayment?.checkNumber
        );
        paymentOverviewStore.updateKeyValue(
          "amountPrepaid",
          prePaidPayment?.amount
        );
      }

      paymentOverviewStore.updateKeyValue(
        "deliveryMethod",
        paymentOverview.deliveryMethod
      );
      paymentOverviewStore.updateKeyValue("cardType", paymentOverview.cardType);
      paymentOverviewStore.updateKeyValue(
        "cardNumber",
        paymentOverview.cardNumber
      );
      paymentOverviewStore.updateKeyValue(
        "cardExpirationDate",
        paymentOverview.cardExpirationDate
      );
      paymentOverviewStore.updateKeyValue(
        "splitPaymentsEqually",
        paymentOverview.splitPaymentsEqually
      );
      paymentOverviewStore.updateKeyValue(
        "scheduledPayments",
        paymentOverview.scheduledPayments?.map((s) => ({ ...s, checked: true }))
      );
      paymentOverviewStore.updateKeyValue(
        "contactId",
        paymentOverview.contactId
      );
    }
  }, []);

  const handlePaymentDueChange = (value: string) => {
    if (value === PaymentDueOptions.OnSpecificDay) {
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", false);
    } else {
      paymentOverviewStore.updateKeyValue("paymentDueOn", null);
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", true);
    }
    setPaymentDueOption(value as PaymentDueOptions);
  };

  const onSubmit = async () => {
    paymentOverviewStore.calculateNet();
    onNext();
  };

  const totalAmount = Number(
    paymentOverviewStore.paymentOverview.totalSale
  ).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Details</h1>
          <p className="text-muted-foreground">
            Manage discounts, payment dates, and fee structures
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 flex items-center">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            Total Sale Amount:
          </span>
          <span className="text-xl font-bold text-primary flex items-center">
            <DollarSign className="h-4 w-4 mr-0.5" />
            {totalAmount}
          </span>
        </div>
      </div>

      <Tabs defaultValue="discounts" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span>Discounts & Sales</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>Pre-Payment Options</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            <span>Fees & Due Dates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discounts">
          <Card>
            <CardHeader>
              <CardTitle>Discounts & Additional Sales</CardTitle>
              <CardDescription>
                Apply additional discounts or add extra sales to this purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                        paymentOverviewStore.paymentOverview?.trade?.toString() ||
                        ""
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

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base font-medium">
                  Early Payment Discount
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2">
                    <Label htmlFor="earlyPaymentDiscount">
                      Discount Amount
                    </Label>
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
                    <span className="font-medium text-muted-foreground">
                      OR
                    </span>
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
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Record any prepaid amounts and payment method details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amountPrepaid">Amount Prepaid</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amountPrepaid"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      placeholder="0.00"
                      value={
                        paymentOverviewStore.paymentOverview?.amountPrepaid?.toString() ||
                        ""
                      }
                      onChange={(e) =>
                        paymentOverviewStore.updateKeyValue(
                          "amountPrepaid",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={
                      paymentOverviewStore.paymentOverview?.paymentMethod || ""
                    }
                    onValueChange={(value) =>
                      paymentOverviewStore.updateKeyValue(
                        "paymentMethod",
                        value
                      )
                    }
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">N/A</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Credit Memo">Credit Memo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {paymentOverviewStore.paymentOverview?.paymentMethod ===
                "Check" && (
                <div className="space-y-2">
                  <Label htmlFor="checkNumber">Check Number</Label>
                  <Input
                    id="checkNumber"
                    placeholder="Enter check number"
                    value={
                      paymentOverviewStore.paymentOverview?.checkNumber?.toString() ||
                      ""
                    }
                    onChange={(e) =>
                      paymentOverviewStore.updateKeyValue(
                        "checkNumber",
                        e.target.value
                      )
                    }
                  />
                </div>
              )}

              {paymentOverviewStore.paymentOverview?.paymentMethod ===
                "Credit Card" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cardType">Card Type</Label>
                      <Select
                        value={
                          paymentOverviewStore.paymentOverview?.cardType || ""
                        }
                        onValueChange={(value) =>
                          paymentOverviewStore.updateKeyValue("cardType", value)
                        }
                      >
                        <SelectTrigger id="cardType">
                          <SelectValue placeholder="Select card type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visa">Visa</SelectItem>
                          <SelectItem value="Mastercard">Mastercard</SelectItem>
                          <SelectItem value="American Express">
                            American Express
                          </SelectItem>
                          <SelectItem value="Discover">Discover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">
                        Card Number (Last 4 digits)
                      </Label>
                      <Input
                        id="cardNumber"
                        maxLength={4}
                        placeholder="1234"
                        value={
                          paymentOverviewStore.paymentOverview?.cardNumber?.toString() ||
                          ""
                        }
                        onChange={(e) =>
                          paymentOverviewStore.updateKeyValue(
                            "cardNumber",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardExpirationDate">
                        Expiration Date
                      </Label>
                      <Input
                        id="cardExpirationDate"
                        placeholder="MM/YY"
                        value={
                          paymentOverviewStore.paymentOverview
                            ?.cardExpirationDate?.toString() || ""
                        }
                        onChange={(e) =>
                          paymentOverviewStore.updateKeyValue(
                            "cardExpirationDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Due Dates & Late Fees</CardTitle>
              <CardDescription>
                Set payment due dates and configure late fee options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Payment Due Date
                </Label>
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
                      <span className="text-muted-foreground">
                        of each month
                      </span>
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

              <Separator />

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
                          paymentOverviewStore.updateKeyValue(
                            "lateFeePercent",
                            null
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-medium text-muted-foreground">
                      OR
                    </span>
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
                            paymentOverviewStore.updateKeyValue(
                              "lateFee",
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
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={onSubmit} size="lg" className="gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaymentDetails;
