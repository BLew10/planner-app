"use client";
import React from "react";
import styles from "./AdvertisementRow.module.scss";
import { SlotInfo } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import { MONTHS } from "@/lib/constants";
import SlotComponent from "./SlotComponent";

interface AdvertisementRowProps {
  slots: SlotInfo[] | null;
  adType: Partial<Advertisement>;
}

const AdvertisementRow: React.FC<AdvertisementRowProps> = ({
  slots,
  adType,
}) => {
  // Transform slots array into a map where keys are month indices and values are arrays of all slots for that month
  const slotsByMonth = (slots || []).reduce(
    (acc, slot) => {
      const monthIndex = slot.month ?? 0;
      if (!acc[monthIndex]) acc[monthIndex] = [];
      acc[monthIndex].push(slot);
      return acc;
    },
    {} as Record<number, SlotInfo[]>
  );

  if (adType.perMonth === 0) {
    return (
      <div className={`${styles.adRow}`}>
        <h2 className={styles.adTitle}>{adType.name}</h2>
        <div className={styles.grid}>
          {slots?.map((slot) => (
            <div key={slot.slot} className={styles.gridItem}>
              <p className={styles.gridItemText}><span className={styles.label}>Contact Company:</span> {slot.contactCompany}</p>
              <p className={styles.gridItemText}><span className={styles.label}>Quantity:</span> {slot.slot}</p>
            </div>
          ))}
          {!slots && <p className={styles.gridItemText}>No {adType.name} purchased</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.adRow}`}>
      <h2 className={styles.adTitle}>{adType.name}</h2>
      <div className={styles.monthsContainer}>
        {MONTHS.map((month, index) => {
          const monthIndex = index + 1;
          const monthSlots = slotsByMonth[monthIndex] || [];
          return (
            <div key={month} className={styles.month}>
              <h3 className={styles.monthName}>{month}</h3>
              <div className={styles.slotsContainer}>
                {Array.from(
                  { length: adType.perMonth || 0 },
                  (_, slotIndex) => {
                    const slotsForIndex = monthSlots.filter(
                      (s) => s.slot === slotIndex + 1
                    );
                    return slotsForIndex.length === 0 ? (
                      <SlotComponent
                        key={`empty-${slotIndex}`}
                        slotInfo={{
                          slot: null,
                          month: monthIndex,
                          date: "",
                          contactCompany: "",
                          id: "",
                        }}
                        index={slotIndex}
                        adIsDayType={adType.isDayType}
                      />
                    ) : (
                      slotsForIndex.map((slotInfo, i) => (
                        <SlotComponent
                          key={`slot-${slotIndex}-${i}`}
                          slotInfo={slotInfo}
                          index={slotIndex}
                          adIsDayType={adType.isDayType}
                        />
                      ))
                    );
                  }
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvertisementRow;
