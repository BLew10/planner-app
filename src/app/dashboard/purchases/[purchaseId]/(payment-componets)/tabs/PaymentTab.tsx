"use client";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, CreditCard } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentMethod } from "@/store/paymentOverviewStore";
export const PaymentTab = () => {
  const paymentOverviewStore = usePaymentOverviewStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    paymentOverviewStore.paymentOverview?.paymentMethod || "Cash"
  );

  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setPaymentMethod(value);
    paymentOverviewStore.updateKeyValue("paymentMethod", value);
    switch (value) {
      case "Cash":
        paymentOverviewStore.updateKeyValue("checkNumber", "");
        paymentOverviewStore.updateKeyValue("cardType", "");
        paymentOverviewStore.updateKeyValue("cardNumber", "");
        paymentOverviewStore.updateKeyValue("cardExpiration", "");
        break;
      case "Check":
        paymentOverviewStore.updateKeyValue("cardType", "");
        paymentOverviewStore.updateKeyValue("cardNumber", "");
        paymentOverviewStore.updateKeyValue("cardExpiration", "");
        break;
      case "Credit Card":
        paymentOverviewStore.updateKeyValue("checkNumber", "");
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Record any prepaid amounts and payment method details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-4">
            <Label htmlFor="amountPrepaid" className="text-base font-medium">
              Amount Prepaid
            </Label>
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

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-medium">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                handlePaymentMethodChange(value as PaymentMethod)
              }
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Cash" id="Cash" />
                <Label htmlFor="Cash">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Check" id="Check" />
                <Label htmlFor="Check">Check</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Credit Card" id="Credit Card" />
                <Label htmlFor="Credit Card">Credit Card</Label>
              </div>
            </RadioGroup>

            {/* Conditionally show Check Number input */}
            {paymentMethod === "Check" && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="checkNumber">Check Number</Label>
                <Input
                  id="checkNumber"
                  placeholder="Check #"
                  value={
                    paymentOverviewStore.paymentOverview?.checkNumber || ""
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

            {/* Conditionally show Credit Card fields */}
            {paymentMethod === "Credit Card" && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardType">Card Type</Label>
                  <Select
                    value={paymentOverviewStore.paymentOverview?.cardType || ""}
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
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      className="pl-8"
                      placeholder="••••"
                      maxLength={4}
                      value={
                        paymentOverviewStore.paymentOverview?.cardNumber || ""
                      }
                      onChange={(e) =>
                        paymentOverviewStore.updateKeyValue(
                          "cardNumber",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardExpiration">
                    Expiration Date (MM/YY)
                  </Label>
                  <Input
                    id="cardExpiration"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={paymentOverviewStore.paymentOverview?.cardExpiration || ""}
                    onChange={(e) => {
                      const input = e.target.value;

                      // Only allow digits and slash
                      const filteredInput = input.replace(/[^\d/]/g, "");

                      // Auto-format as MM/YY
                      let formattedValue = filteredInput;
                      if (
                        filteredInput.length >= 2 &&
                        !filteredInput.includes("/")
                      ) {
                        formattedValue =
                          filteredInput.substring(0, 2) +
                          "/" +
                          filteredInput.substring(2);
                      }

                      // Validate month (01-12)
                      const monthPart = formattedValue.split("/")[0];
                      if (monthPart && monthPart.length === 2) {
                        const month = parseInt(monthPart, 10);
                        if (month < 1 || month > 12) {
                          return; // Invalid month
                        }
                      }

                      paymentOverviewStore.updateKeyValue(
                        "cardExpiration",
                        formattedValue
                      );
                    }}
                    onBlur={(e) => {
                      // Final validation on blur
                      const value = e.target.value;
                      const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;

                      if (value && !regex.test(value)) {
                        // Reset to empty if invalid format
                        paymentOverviewStore.updateKeyValue(
                          "cardExpiration",
                          ""
                        );
                        // You could also add error messaging here
                      }
                    }}
                  />
                </div>
              </div>
            )}
            {paymentMethod && (
              <div>
                <input
                  type="hidden"
                  value={paymentMethod}
                  onChange={() =>
                    paymentOverviewStore.updateKeyValue(
                      "paymentMethod",
                      paymentMethod
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
