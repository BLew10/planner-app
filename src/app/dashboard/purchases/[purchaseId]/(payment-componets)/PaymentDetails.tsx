"use client";
import React, { useState, useEffect } from "react";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import { usePurchasesStore } from "@/store/purchaseStore";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";

import { DiscountsTab } from "./tabs/DiscountsTab";
import { PaymentTab } from "./tabs/PaymentTab";
import { FeesTab } from "./tabs/FeesTab";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import { ArrowRight, DollarSign, Wallet, Receipt, Percent } from "lucide-react";

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
    if (paymentOverview?.paymentDueOn) {
      setPaymentDueOption(PaymentDueOptions.OnSpecificDay);
      paymentOverviewStore.updateKeyValue(
        "paymentDueOn",
        paymentOverview?.paymentDueOn
      );
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", false);
    } else {
      setPaymentDueOption(PaymentDueOptions.OnLastDay);
      paymentOverviewStore.updateKeyValue("paymentOnLastDay", true);
      paymentOverviewStore.updateKeyValue("paymentDueOn", null);
    }

    paymentOverviewStore.updateKeyValue("totalSale", purchaseStore.total);
    if (paymentOverview) {
      // Basic Information
      paymentOverviewStore.updateKeyValue("id", paymentOverview?.id);
      paymentOverviewStore.updateKeyValue(
        "contactId",
        paymentOverview?.contactId
      );

      // Discounts & Sales Tab
      paymentOverviewStore.updateKeyValue(
        "additionalDiscount1",
        paymentOverview?.additionalDiscount1
      );
      paymentOverviewStore.updateKeyValue(
        "additionalDiscount2",
        paymentOverview?.additionalDiscount2
      );
      paymentOverviewStore.updateKeyValue(
        "additionalSales1",
        paymentOverview?.additionalSales1
      );
      paymentOverviewStore.updateKeyValue(
        "additionalSales2",
        paymentOverview?.additionalSales2
      );
      paymentOverviewStore.updateKeyValue("trade", paymentOverview?.trade);
      paymentOverviewStore.updateKeyValue(
        "earlyPaymentDiscount",
        paymentOverview?.earlyPaymentDiscount
      );
      paymentOverviewStore.updateKeyValue(
        "earlyPaymentDiscountPercent",
        paymentOverview?.earlyPaymentDiscountPercent
      );

      // Fees & Due Dates Tab
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
      paymentOverviewStore.updateKeyValue("lateFee", paymentOverview?.lateFee);
      paymentOverviewStore.updateKeyValue(
        "lateFeePercent",
        paymentOverview?.lateFeePercent
      );

      // Additional Settings
      paymentOverviewStore.updateKeyValue(
        "deliveryMethod",
        paymentOverview?.deliveryMethod
      );
      paymentOverviewStore.updateKeyValue(
        "splitPaymentsEqually",
        paymentOverview?.splitPaymentsEqually
      );
      paymentOverviewStore.updateKeyValue(
        "scheduledPayments",
        paymentOverview?.scheduledPayments?.map((s) => ({ ...s, checked: true }))
      );

      // Handle prepaid payment if it exists
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
        paymentOverviewStore.updateKeyValue(
          "paymentMethod",
          prePaidPayment?.paymentMethod
        );
        paymentOverviewStore.updateKeyValue(
          "cardType",
          prePaidPayment?.cardType
        );
        paymentOverviewStore.updateKeyValue(
          "cardNumber",
          prePaidPayment?.cardNumber
        );
        console.log('prePaidPayment?.cardExpiration', prePaidPayment?.cardExpiration);
        paymentOverviewStore.updateKeyValue(
          "cardExpiration",
          prePaidPayment?.cardExpiration
        );
      }
    }
  }, []);

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
          <DiscountsTab />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentTab />
        </TabsContent>

        <TabsContent value="fees">
          <FeesTab />
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
