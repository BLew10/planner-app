"use client";

import React, { useEffect, useState } from "react";
import PaymentDetails from "./PaymentDetails";
import PaymentSchedule from "./PaymentSchedule";
import PaymentOverview from "./PaymentOverview";
import { useSearchParams, useRouter } from "next/navigation";
import { usePaymentStore } from "@/store/paymentStore";
import styles from "./PaymentForm.module.scss";
import { getPurchaseById } from "@/lib/data/purchase";
import { getPaymentById } from "@/lib/data/payment";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { ToastContainer } from "react-toastify";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";

interface PaymentFormProps {
  paymentId: string | null | undefined;
}

const PaymentForm = ({ paymentId }: PaymentFormProps) => {
  const router = useRouter();
  const paymentStore = usePaymentStore();

  const [purchaseData, setPurchaseData] = useState<Partial<PurchaseOverviewModel> | null>(null);
  const [paymentData, setPaymentData] = useState<Partial<PaymentOverviewModel> | null>(null);
  const [step, setStep] = useState(1);
  const searchParams = useSearchParams();

  useEffect(() => {
    const purchaseId = searchParams.get("purchaseId");
    if (!purchaseId) {
      router.push(`/dashboard/purchases`);
      return;
    }
    const fetchPurchases = async (purchaseId: string) => {
      const purchase: Partial<PurchaseOverviewModel> | null =
        await getPurchaseById(purchaseId);
      if (purchase) {
        setPurchaseData(purchase);
        paymentStore.updateKeyValue(
          "totalSale",
          Number(purchase.amountOwed).toFixed(2)
        );
        paymentStore.updateKeyValue("contactId", purchase.contactId);
        paymentStore.updateKeyValue("purchaseId", purchase.id);
      } else {
        router.push(`/dashboard/purchases`);
        return;
      }
    };

    fetchPurchases(purchaseId);

    if (paymentId) {
      const fetchPayment = async (paymentId: string) => {
        const payment = await getPaymentById(paymentId);
        if (payment) {
          setPaymentData(payment);
        }
      };
      fetchPayment(paymentId);
    }
  }, [searchParams, paymentId]);


  return (
    <>
      <AnimateWrapper>
      <ToastContainer />
        <h1 className={styles.heading}>
        {step !== 1 && (
          <button className={styles.backButton} onClick={() => setStep(prev => prev - 1)}>
            Back
          </button>
        )}
          Payment Details for{" "}
          <span>
            {purchaseData?.contact?.contactContactInformation?.company}{" "}
          </span>{" "}
          for the year <span>{purchaseData?.year}</span>
        </h1>
        {step === 1 && <PaymentDetails onNext={() => setStep(2)} />}
        {step === 2 && <PaymentSchedule onNext={() => setStep(3)} />}
        {step === 3 && <PaymentOverview year={purchaseData?.year?.toString()}  />}
      </AnimateWrapper>
    </>
  );
};

export default PaymentForm;
