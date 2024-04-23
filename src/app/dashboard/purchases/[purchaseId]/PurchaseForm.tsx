"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Advertisement } from "@prisma/client";
import styles from "./PurchaseForm.module.scss";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import { getContactById } from "@/lib/data/contact";
import { usePurchasesStore } from "@/store/purchaseStore";
import { getPurchaseByContactIdAndYear } from "@/lib/data/purchase";
import { useSearchParams } from "next/navigation";
import { CalendarEdition } from "@prisma/client";
import SelectCalendars from "./SelectCalendars";
import PurchaseDetails from "./PurchaseDetails";
import PurchaseOverview from "./PurchaseOverview";
import { FUTURE_YEARS } from "@/lib/constants";
import { ToastContainer, toast} from "react-toastify";
import { upsertPurchase } from "@/actions/purchases/upsertPurchase";

interface PurchaseProps {
  advertisementTypes: Partial<Advertisement>[];
  calendars: Partial<CalendarEdition>[];
  purchaseId?: string;
}

interface Contact {
  id: string;
  companyName: string;
}
const defaultYear = FUTURE_YEARS[0].value;
const Purchase: React.FC<PurchaseProps> = ({
  advertisementTypes,
  calendars,
  purchaseId = null,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const purchaseStore = usePurchasesStore();
  const [year, setYear] = useState<string>(defaultYear);
  const [purchase, setPurchase] =
    useState<Partial<PurchaseOverviewModel> | null>(null);
  const [step, setStep] = useState(1);
  const goToNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const goToPreviousStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const fetchPurchases = async (contactId: string, year: string) => {
    const purchase = await getPurchaseByContactIdAndYear(contactId, year);
    if (purchase) {
      setPurchase(purchase);
    } else {
      purchaseStore.reset();
    }
  };

  useEffect(() => {
    const fetchContact = async (contactId: string) => {
      const contactData = await getContactById(contactId);
      if (!contactData) {
        router.push("/dashboard/contacts");
        return;
      }
      if (contactData) {
        const contact = {
          id: contactData.id as string,
          companyName: contactData.contactContactInformation?.company || "",
        };
        setContact(contact);
      }
    };
    const contactId = searchParams?.get("contactId") as string;
    fetchContact(contactId);
    const paramYear = searchParams?.get("year") as string;
    if (paramYear) {
      setYear(paramYear);
    }

    fetchPurchases(contactId, paramYear);

    return () => {
      purchaseStore.reset();
    };
  }, [purchaseId, searchParams]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
    fetchPurchases(contact?.id as string, e.target.value);
  };

  const onSave = async () => {
    setIsSaving(true);
    const { purchaseOverview } = purchaseStore;
    const success = await upsertPurchase(purchaseOverview, contact?.id as string, year, purchaseId as string);
    setIsSaving(false);
    if (success) {
      router.push(`/dashboard/purchases?year=${year}`);
    } else {
      toast.error("Something went wrong. Purchase could not be saved");
    }
  };
  return (
    <section className={styles.container}>
      <ToastContainer />
      <h2 className={styles.title}>
        Purchase from{" "}
        <span className={styles.companyName}>{contact?.companyName}</span> for
        year <span className={styles.year}>{year}</span>
      </h2>
      {step !== 1 && (
        <button className={styles.back} onClick={goToPreviousStep}>
          Go Back
        </button>
      )}
      {step === 1 && (
        <SelectCalendars
          calendars={calendars}
          purchase={purchase}
          onNext={goToNextStep}
          onYearChange={handleYearChange}
          year={year}
        />
      )}
      {step === 2 && (
        <PurchaseDetails
          advertisementTypes={advertisementTypes}
          purchase={purchase}
          onNext={goToNextStep}
          calendars={calendars}
          year={year}
        />
      )}
      {step === 3 && (
        <PurchaseOverview
          calendars={calendars}
          advertisementTypes={advertisementTypes}
        />
      )}
      {step === 3 && (
        <button className={styles.back} onClick={onSave}>
          {isSaving ? "Saving..." : "Save"}
        </button>
      )}
    </section>
  );
};

export default Purchase;
