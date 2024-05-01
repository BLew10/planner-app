"use client";
import React, { useState, useEffect } from "react";
import styles from "./PurchaseOverview.module.scss";
import { usePurchasesStore } from "@/store/purchaseStore";
import { CalendarEdition } from "@prisma/client";
import { Advertisement } from "@prisma/client";
import { MONTHS } from "@/lib/constants";
interface PurchaseOverviewProps {
  calendars: Partial<CalendarEdition>[];
  advertisementTypes: Partial<Advertisement>[];
  onNext: () => void;
}
const PurchaseOverview = ({
  calendars,
  advertisementTypes,
  onNext,
}: PurchaseOverviewProps) => {
  const [selectedCalendars, setSelectedCalendars] = useState<
    Partial<CalendarEdition>[]
  >([]);
  const { purchaseOverview, total } = usePurchasesStore();
  useEffect(() => {
    const filteredCalendars = calendars?.filter(
      (calendar) => calendar.id && purchaseOverview?.[calendar.id]
    );
    setSelectedCalendars(filteredCalendars || []);
  }, [purchaseOverview, calendars]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Purchase Overview</h1>
      <h2 className={styles.subtitle}>Total: ${total.toFixed(2)}</h2>
      {selectedCalendars.map((c) => (
        <div key={c.id} className={styles.calendar}>
          <h2 className={styles.calendarName}>{c.name}</h2>
          <div className={`${styles.header}`}>
            <p className={styles.qtyCol}>Qty</p>
            <p className={styles.packageCol}>Package</p>

            <p className={styles.totalCol}>Total Sale Amount</p>
            <div className={styles.monthsCol}>
              <p className={styles.monthsTitle}>
                Months and slots which ad inventory was purchased
              </p>
              <div className={styles.months}>
                {MONTHS.map((m) => (
                  <p key={m}>{m.slice(0, 3)}</p>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.table}>
            {advertisementTypes.map((a) => (
              <div key={a.id} className={styles.tableRow}>
                <p className={styles.qtyCol}>
                  {purchaseOverview?.[c.id!]?.[a.id!]?.quantity || 0}
                </p>
                <p className={styles.packageCol}>{a.name}</p>
                <p className={styles.totalCol}>
                  {" "}
                  ${purchaseOverview?.[c.id!]?.[a.id!]?.charge || 0}
                </p>
                <div className={styles.monthsCol}>
                  <div className={styles.months}>
                    {MONTHS.map((m, i) => {
                      const slotsInMonth = purchaseOverview?.[c.id!]?.[
                        a.id!
                      ]?.slots?.filter((s) => s?.month === i + 1);

                      return (
                        <div key={m} className={styles.slots}>
                          {slotsInMonth && slotsInMonth.length > 0 ? (
                            slotsInMonth.map((slot, index) => (
                              <div key={index} className={styles.slot}>
                                {slot.slot}
                              </div>
                            ))
                          ) : (
                            <div className={styles.slot}> </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        className={styles.continue}
        onClick={onNext}  
      >
        Continue
      </button>
    </div>
  );
};

export default PurchaseOverview;
