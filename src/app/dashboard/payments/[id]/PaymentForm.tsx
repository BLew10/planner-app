"use client";

import React, { useState, useEffect } from "react";
import styles from "./PaymentForm.module.scss";
import MoneyInput from "@/app/(components)/form/MoneyInput";
import TextInput from "@/app/(components)/form/TextInput";
import SelectInput from "@/app/(components)/form/SelectInput";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { getPaymentOverviewById } from "@/lib/data/paymentOverview";
import { getPurchaseById } from "@/lib/data/purchase";
import {
  upsertPayment,
  UpsertPaymentData,
} from "@/actions/payment/upsertPayment";
import { PaymentModel } from "@/lib/models/payment";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import { useSearchParams, useRouter } from "next/navigation";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { useToast } from "@/hooks/shadcn/use-toast";

interface PaymentFormProps {
  payment: Partial<PaymentModel> | null;
}
const PaymentDetails = ({ payment }: PaymentFormProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<PaymentModel> | null>(
    payment
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOverview, setPaymentOverview] =
    useState<Partial<PaymentOverviewModel> | null>(null);
  const [purchaseOverview, setPurchaseOverview] =
    useState<Partial<PurchaseOverviewModel> | null>(null);

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
      setFormData({
        id: payment.id,
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        checkNumber: payment.checkNumber,
      });
    } else {
      setFormData({
        amount: null,
        paymentMethod: "",
        paymentDate: formatDateToString(new Date()),
        checkNumber: "",
      });
    }
  }, [searchParams]);

  const onSubmit = async () => {
    const data: UpsertPaymentData = {
      id: formData?.id || "",
      amount: Number(formData?.amount),
      paymentMethod: formData?.paymentMethod || "",
      paymentDate: formData?.paymentDate || "",
      checkNumber: formData?.checkNumber || "",
      purchaseId: purchaseOverview?.id || "",
      paymentOverviewId: paymentOverview?.id || "",
      contactId: purchaseOverview?.contact?.id || "",
    };
    
    if (formData) {
      setIsSubmitting(true);
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
    }
  };
  return (
    <AnimateWrapper>
      <div className={styles.container}>
        <h1 className={styles.title}>Payment Details</h1>
        <form className={styles.form}>
          <MoneyInput
            name="amount"
            label="Amount"
            isRequired={true}
            onChange={(e) => {
              setFormData({
                ...formData,
                amount: Number(e.target.value),
              });
            }}
            value={formData?.amount?.toString() || ""}
          />
          <SelectInput
            name="paymentMethod"
            label="Payment Method"
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentMethod: e.target.value,
              })
            }
            value={formData?.paymentMethod || "N/A"}
            options={[
              { value: "", label: "N/A" },
              { value: "Cash", label: "Cash" },
              { value: "Check", label: "Check" },
              { value: "Credit Card", label: "Credit Card" },
              { value: "Credit Memo", label: "Credit Memo" },
            ]}
          />

          <MoneyInput
            name="checkNumber"
            label="Check Number"
            isRequired={formData?.paymentMethod === "Check"}
            onChange={(e) => {
              setFormData({
                ...formData,
                checkNumber: e.target.value,
              });
            }}
            value={formData?.checkNumber?.toString() || ""}
          />
          <TextInput
            name="paymentDate"
            label="Payment Date"
            type="date"
            isRequired={true}
            value={
              (formData?.paymentDate &&
                new Date(formData?.paymentDate).toISOString().split("T")[0]) ||
              new Date().toISOString().split("T")[0]
            }
            onChange={(e) => {
              setFormData({
                ...formData,
                paymentDate: formatDateToString(e.target.value),
              });
            }}
          />
          <button
            type="button"
            className={styles.submitButton}
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </AnimateWrapper>
  );
};

export default PaymentDetails;
