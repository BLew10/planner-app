"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import SelectInput from "@/app/(components)/form/SelectInput";
import PurchaseDayType from "./PurchaseDayType";
import PurchaseNonDayType from "./PurchaseNonDayType";
import { usePurchasesStore } from "@/store/purchaseStore";
import { CalendarEdition } from "@prisma/client";
import styles from "./PurchaseDetails.module.scss";
import { MdArrowBack } from "react-icons/md";
import Link from "next/link";

interface PurchaseDetailsProps {
  calendars: Partial<CalendarEdition>[] | null;
}

const PurchaseDetails: React.FC<PurchaseDetailsProps> = ({ calendars }) => {
  const purchaseStore = usePurchasesStore();
  const { id } = useParams();
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedCalendar, setSelectedCalendar] = useState<string>("");

  const YEARS: string[] = Array.from(new Array(3), (val, index) =>
    (new Date().getFullYear() + index).toString()
  );

  const MONTHS: number[] = Array.from(new Array(12), (val, index) => index);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedYear(e.target.value);
  const handleCalendarChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedCalendar(e.target.value);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log(e.target);
    }

  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <div className={styles.header}>
        <Link
          className={styles.backArrow}
          href={`/dashboard/contacts/${id}/purchase`}
        >
          <MdArrowBack /> Edit Purchase Details
        </Link>
        <h2 className={styles.title}>
          {purchaseStore.purchaseData?.companyName} Purchase Details{" "}
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
      {purchaseStore.purchaseData?.purchases?.map((purchase, index) => {
        if (purchase?.isDayType) {
          return (
            <>
              <h3 className={styles.text}>{purchase?.name}</h3>
              <h4 className={styles.text}>
                Charge:{" "}
                <span className={styles.charge}>${purchase?.charge}</span>
              </h4>
              <h4 className={styles.text}>
                Quantity:{" "}
                <span className={styles.quantity}>{purchase?.quantity}</span>
              </h4>
              <div className={styles.grid} key={`daytype-${index}`}>
                {MONTHS.map((month) => (
                  <PurchaseDayType
                    key={`${selectedYear}-${month}`}
                    year={parseInt(selectedYear, 10)}
                    month={month}
                  />
                ))}
              </div>
            </>
          );
        }
        return (
          <>
            <h3 className={styles.text}>{purchase?.name}</h3>
            <h4 className={styles.text}>
              Charge: <span className={styles.charge}>${purchase?.charge}</span>
            </h4>
            <h4 className={styles.text}>
              Quantity:{" "}
              <span className={styles.quantity}>{purchase?.quantity}</span>
            </h4>
            <div className={styles.grid} key={`nondaytype-${index}`}>
              <PurchaseNonDayType key={purchase?.id} purchase={purchase} />
            </div>
          </>
        );
      })}
      <button type="submit" className={styles.submitButton}>
        Submit
      </button>
    </form>
  );
};

export default PurchaseDetails;
