"use client";

import React, { useEffect } from "react";
import styles from "./SelectCalendars.module.scss";
import CheckboxGroup from "@/app/(components)/form/CheckboxGroup";
import { CalendarEdition } from "@prisma/client";
import { usePurchasesStore } from "@/store/purchaseStore";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { FUTURE_YEARS } from "@/lib/constants";
import SelectInput from "@/app/(components)/form/SelectInput";
interface SelectCalendarsProps {
  calendars: Partial<CalendarEdition>[];
  purchase?: Partial<PurchaseOverviewModel> | null;
  onNext: () => void;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  year: string
}

const SelectCalendars = ({ calendars, onNext, purchase, onYearChange, year }: SelectCalendarsProps) => {
  const purchaseStore = usePurchasesStore();

  useEffect(() => {
    if (purchase) {
      purchase.calendarEditions?.forEach((calendar) => {
        purchaseStore.addCalendarId(calendar.id);
      })
    }

  }, [purchase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const calendarId = e.target.value;
    if (e.target.checked) {
      purchaseStore.addCalendarId(calendarId);
    } else {
      purchaseStore.removeCalendarId(calendarId);
    }
  };
console.log('year', year)
  return (
    <AnimateWrapper>
      <div className={styles.container}>
        <div className={styles.year}>
          <h2 className={styles.title}>Select Year</h2>
            <SelectInput
              name="year"
              options={FUTURE_YEARS}
              value={year}
              onChange={onYearChange}
            />
        </div>
        <h2 className={styles.title}>Select Calendars</h2>
        <CheckboxGroup
          name="calendars"
          options={calendars.map((calendar) => ({
            label: calendar.name,
            value: calendar.id,
            checked: purchaseStore.purchaseOverview?.[calendar.id as string]
              ? true
              : false,
          }))}
          useGrid={false}
          onChange={handleChange}
        />
        <button className={styles.button} onClick={onNext}>Continue</button>
      </div>
    </AnimateWrapper>
  );
};

export default SelectCalendars;
