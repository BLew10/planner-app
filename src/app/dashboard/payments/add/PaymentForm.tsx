"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./PaymentForm.module.scss";
import {
  UpsertPaymentData,
  upsertPayment,
} from "@/actions/payments/upsertPayment";
import { getPurchasesWithoutPayment, PurchaseInfo } from "@/lib/data/purchase";
import { getContactById } from "@/lib/data/contact";
import { PAYMENT_FREQUENCIES } from "@/lib/constants";

import SelectInput from "@/app/(components)/form/SelectInput";
import CheckboxGroup from "@/app/(components)/form/CheckboxGroup";
import TextInput from "@/app/(components)/form/TextInput";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import PaymentFormModal from "./PaymentFormModal";
import { toast, ToastContainer } from "react-toastify";

interface Contact {
  id: string;
  companyName: string;
}

const PaymentForm = () => {
  const router = useRouter();
  const [frequency, setFrequency] = useState<string>(
    PAYMENT_FREQUENCIES[2].value
  );
  const [contact, setContact] = useState<Contact | null>();
  const [contactPurchases, setContactPurchases] = useState<
    PurchaseInfo[] | null
  >(null);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [totalPayments, setTotalPayments] = useState<number>(12);
  const [paymentTotal, setPaymentTotal] = useState<number>(0);
  const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<UpsertPaymentData | null>(
    null
  );
  const [endDate, setEndDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const notifyError = () => toast.error("Something went wrong. Please try again.");
  const searchParams = useSearchParams();

  useEffect(() => {
    const contactId = searchParams.get("contactId");
    if (!contactId) {
      router.push(`/dashboard/contacts`);
      return;
    }
    const fetchPurchases = async (contactId: string) => {
      const contactPurchases: PurchaseInfo[] | null =
        await getPurchasesWithoutPayment(contactId);
      if (contactPurchases && contactPurchases?.length > 0) {
        setContactPurchases(contactPurchases);
      }
    };
    const fetchContact = async (contactId: string) => {
      const contactData = await getContactById(contactId);
      if (!contactData) {
        router.push(`/dashboard/contacts`);
        return;
      }
      const contact = {
        id: contactId,
        companyName: contactData?.contactContactInformation?.company || "",
      };
      setContact(contact);
    };

    fetchContact(contactId);
    fetchPurchases(contactId);
  }, [searchParams]);

  useEffect(() => {
    const calculateEndDate = () => {
      if (!startDate || !frequency || !totalPayments) return;
      let resultDate = new Date(startDate);
      switch (frequency) {
        case "Daily":
          resultDate.setDate(resultDate.getDate() + totalPayments);
          break;
        case "Weekly":
          // Add 7 days for each payment
          resultDate.setDate(resultDate.getDate() + 7 * totalPayments);
          break;
        case "Monthly":
          resultDate.setMonth(resultDate.getMonth() + totalPayments);
          break;
        case "Annually":
          resultDate.setMonth(resultDate.getMonth() + 12 * totalPayments);
          break;
        default:
          console.warn(`Unhandled frequency: ${frequency}`);
          break;
      }
      setEndDate(resultDate.toISOString().split("T")[0]);
    };

    calculateEndDate();
  }, [startDate, frequency, totalPayments]);

  const onContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contact?.id) {
      return;
    }

    const checkboxes = document.getElementsByName(
      "purchases"
    ) as NodeListOf<HTMLInputElement>;
    const selectedPurchasesIds =
      checkboxes &&
      Array.from(checkboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
    const selectedPurchases =
      contactPurchases?.filter((purchase) =>
        selectedPurchasesIds.includes(purchase.id)
      ) || [];

    const total =
      checkboxes && selectedPurchasesIds.length > 0
        ? selectedPurchases.reduce(
            (acc, purchase) => acc + Number(purchase.amountOwed),
            0
          )
        : paymentTotal || 0;

    const paymentData: UpsertPaymentData = {
      paymentId: null,
      contactId: contact.id,
      purchasesIds: selectedPurchasesIds || [],
      status: "Pending",
      paymentsMade: 0,
      totalPayments: totalPayments,
      totalPaid: 0,
      frequency: frequency,
      startDate: startDate ? new Date(startDate) : new Date(),
      anticipatedEndDate: endDate ? new Date(endDate) : new Date(),
      totalOwed: total,
    };
    setPaymentData(paymentData);
    setOpenPaymentModal(true);
  };

  const onSubmit = async () => {
    if (!paymentData) {
      return;
    }
    setIsSubmitting(true);
   const successs = await upsertPayment(paymentData);
   setIsSubmitting(false);
   if (successs) {
    router.push("/dashboard/payments");
   } else {
     notifyError();
   }
  };

  return (
    <>
      <PaymentFormModal
        isOpen={openPaymentModal}
        closeModal={() => setOpenPaymentModal(false)}
        submit={onSubmit}
        isSubmitting={isSubmitting}
        paymentData={paymentData}
        companyName={contact?.companyName || ""}
      />
      <AnimateWrapper>
        <form onSubmit={onContinue} className={styles.form}>
          <h1 className={styles.title}>Payment Form</h1>
          <p className={styles.contact}>
            Contact: <span>{contact?.companyName}</span>
          </p>
          {!contactPurchases || contactPurchases.length === 0 ? (
            <div>
              <p className={styles.noPurchases}>
                No purchases found. However, you can still create a payment with
                custom data
              </p>
              <TextInput
                label="Amount Owed"
                name="amountOwed"
                type="number"
                value={String(paymentTotal)}
                onChange={(e) => setPaymentTotal(Number(e.target.value))}
              />
            </div>
          ) : (
            <div>
              <label className={styles.label} htmlFor="purchases">
                Select Contact Purchases to Pay{" "}
                <span className={styles.subLabel}>
                  {"(calendar edition - year - amount owed)"}
                </span>
              </label>
              <CheckboxGroup
                name="purchases"
                options={contactPurchases.map((purchase) => ({
                  value: purchase.id,
                  label: `${purchase.calendarEdition.name} - ${
                    purchase.year
                  } - $${Number(purchase.amountOwed).toFixed(2)}`,
                  checked: false,
                }))}
              />
            </div>
          )}
          <SelectInput
            label="Payment Frequency"
            name="frequency"
            value={frequency}
            options={PAYMENT_FREQUENCIES}
            onChange={(e) => setFrequency(e.target.value)}
          />
          <TextInput
            type="date"
            name="startDate"
            label="Payment Start Date"
            onChange={(e) => setStartDate(e.target.value)}
            value={startDate}
          />
          <TextInput
            type="number"
            name="totalPayments"
            label="Total Payments"
            subLabel="number of payments"
            onChange={(e) => setTotalPayments(Number(e.target.value))}
            value={String(totalPayments)}
          />

          <button type="submit" className={styles.submitButton}>
            Continue
          </button>
        </form>
      </AnimateWrapper>
    </>
  );
};

export default PaymentForm;
