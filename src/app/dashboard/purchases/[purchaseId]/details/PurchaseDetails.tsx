"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import SelectInput from "@/app/(components)/form/SelectInput";
import PurchaseDayType from "./PurchaseDayType";
import PurchaseNonDayType from "./PurchaseNonDayType";
import { usePurchasesStore } from "@/store/purchaseStore";
import { CalendarEdition } from "@prisma/client";
import styles from "./PurchaseDetails.module.scss";
import { MdArrowBack } from "react-icons/md";
import {
  upsertPurchase,
  UpsertPurchaseData,
} from "@/actions/purchases/upsertPurchase";
import PurchaseNavigationModal from "./PurchaseNavigationModal";

interface PurchaseDetailsProps {
  calendars: Partial<CalendarEdition>[] | null;
}

const YEARS: string[] = Array.from(new Array(3), (val, index) =>
  (new Date().getFullYear() + index).toString()
);

const MONTHS: number[] = Array.from(new Array(12), (val, index) => index);

const PurchaseDetails: React.FC<PurchaseDetailsProps> = ({ calendars }) => {
  const purchaseStore = usePurchasesStore();
  const router = useRouter();
  const { purchaseId } = useParams();
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contactId");

  useEffect(() => {
    if (!contactId) {
      router.push("/dashboard/contacts");
      return;
    }
  }, [searchParams]);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedCalendar, setSelectedCalendar] = useState<string>(
    calendars?.[0]?.id || ""
  );
  const [showNavigationModal, setShowNavigationModal] =
    useState<boolean>(false);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedYear(e.target.value);
  const handleCalendarChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedCalendar(e.target.value);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const purchases = purchaseStore.purchaseOverview?.purchases;
    if (!purchases) return;

    let purchaseData: Record<
      string,
      {
        selectedDates: {
          month: number;
          slot: number;
          checked: boolean;
          date: Date | null;
        }[];
        charge?: number;
        quantity?: number;
      }
    > = {};

    purchases.forEach((purchase) => {
      if (!purchase || !purchase.advertisementId) return;

      const advertisementId = purchase.advertisementId;
      purchaseData[advertisementId] = {
        selectedDates: [],
        charge: purchase.charge,
        quantity: purchase.quantity,
      };

      for (let month = 0; month < 12; month++) {
        const checkboxes = document.getElementsByName(
          `adid-${advertisementId}-month-${month + 1}`
        ) as NodeListOf<HTMLInputElement>;

        const selectedDates = Array.from(checkboxes).map((checkbox, index) => ({
          month: month + 1,
          slot: index + 1,
          checked: checkbox.checked,
          date: Number.isNaN(Number(checkbox.value))
            ? new Date(checkbox.value)
            : null,
        }));

        purchaseData[advertisementId].selectedDates.push(
          ...selectedDates.filter((date) => date.checked)
        );
      }
    });

    const data: UpsertPurchaseData = {
      contactId: purchaseStore.purchaseOverview?.contactId as string,
      purchaseId: purchaseId as string,
      year: selectedYear,
      calendarId: selectedCalendar,
      purchaseData,
    };
    await upsertPurchase(data);
    setShowNavigationModal(true);
  };

  return (
    <>
      <PurchaseNavigationModal
        isOpen={showNavigationModal}
        contactId={contactId as string}
      />
      <form className={styles.container} onSubmit={onSubmit}>
        <div className={styles.header}>
          <Link
            className={styles.backArrow}
            href={`/dashboard/purchases/${purchaseId}?contactId=${contactId}`}
          >
            <MdArrowBack /> Edit Purchase Details
          </Link>
          <h2 className={styles.title}>
            {purchaseStore.purchaseOverview?.companyName} Purchase Details{" "}
          </h2>
        </div>
        <SelectInput
          label="Select a year"
          name="year"
          value={selectedYear}
          options={YEARS.map((year) => ({ label: year, value: year }))}
          onChange={handleYearChange}
        />
        <SelectInput
          label="Select a calendar"
          name="calendar"
          value={selectedCalendar}
          options={
            calendars?.map((calendar) => ({
              label: calendar.name || "",
              value: calendar.id || "",
            })) || []
          }
          onChange={handleCalendarChange}
        />
        {purchaseStore.purchaseOverview?.purchases?.map((purchase, index) => {
          if (purchase?.isDayType) {
            return (
              <div key={`daytype-${index}`}>
                <h3 className={styles.text}>{purchase?.name}</h3>
                <h4 className={styles.text}>
                  Charge:{" "}
                  <span className={styles.charge}>${purchase?.charge}</span>
                </h4>
                <h4 className={styles.text}>
                  Quantity:{" "}
                  <span className={styles.quantity}>{purchase?.quantity}</span>
                </h4>
                <div className={styles.grid}>
                  {MONTHS.map((month) => (
                    <PurchaseDayType
                      key={`${selectedYear}-${month}`}
                      year={parseInt(selectedYear, 10)}
                      month={month}
                      purchase={purchase}
                    />
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={`nondaytype-${index}`}>
              <h3 className={styles.text}>{purchase?.name}</h3>
              <h4 className={styles.text}>
                Charge:{" "}
                <span className={styles.charge}>${purchase?.charge}</span>
              </h4>
              <h4 className={styles.text}>
                Quantity:{" "}
                <span className={styles.quantity}>{purchase?.quantity}</span>
              </h4>
              <div className={styles.grid}>
                <PurchaseNonDayType
                  key={purchase?.advertisementId}
                  purchase={purchase}
                />
              </div>
            </div>
          );
        })}
        <button type="submit" className={styles.submitButton}>
          {purchaseId !== "add" ? "Update" : "Create"}
        </button>
      </form>
    </>
  );
};

export default PurchaseDetails;
