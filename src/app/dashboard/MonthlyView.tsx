"use client";

import React, { useEffect, useState } from "react";
import { MONTHS } from "@/lib/constants";
import { Advertisement } from "@prisma/client";
import { PurchaseSlotDetails } from "@/lib/data/advertisementPurchases";
import styles from "./MonthlyView.module.scss";
import { MdDoneAll } from "react-icons/md";
import MonthlyPurchasesModal from "./MonthlyPurchasesModal";

interface MonthlyViewProps {
  monthIndex: number;
  purchaseData: PurchaseSlotDetails[] | null;
  advertisements: Partial<Advertisement>[] | null;
  calendarId: string;
  year: number;
}
interface AvailableSlotsResult {
  [advertisementId: string]: number;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({
  monthIndex,
  purchaseData,
  advertisements,
  calendarId,
  year,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotsResult>(
    {}
  );
  function calculateAvailableSlots(
    advertisements: Partial<Advertisement>[] | null,
    purchaseSlots: PurchaseSlotDetails[] | null
  ): AvailableSlotsResult {
    const totalSlotsPerAd = advertisements?.reduce<AvailableSlotsResult>(
      (acc, ad) => {
        if (ad.id && typeof ad.perMonth === "number") {
          acc[ad.id] = ad.perMonth;
        }
        return acc;
      },
      {}
    );

    const usedSlotsPerAd = purchaseSlots?.reduce<AvailableSlotsResult>(
      (acc, slot) => {
        const adId = slot.advertisementPurchase.advertisement.id;
        if (adId) {
          acc[adId] = (acc[adId] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    const availableSlots = Object.keys(
      totalSlotsPerAd || {}
    ).reduce<AvailableSlotsResult>((acc, adId) => {
      acc[adId] =
        totalSlotsPerAd![adId] -
        (usedSlotsPerAd ? usedSlotsPerAd[adId] || 0 : 0);
      return acc;
    }, {});

    return availableSlots;
  }

  useEffect(() => {
    const availableSlots = calculateAvailableSlots(
      advertisements,
      purchaseData
    );
    setAvailableSlots(availableSlots);
  }, [advertisements, purchaseData]);

  return (
    <>
      <MonthlyPurchasesModal
        isOpen={openModal}
        closeModal={() => setOpenModal(false)}
        monthIndex={monthIndex+1}
        calendarId={calendarId}
        year={year}
        advertisements={advertisements}
      />

      <div className={styles.card} onClick={() => setOpenModal(true)}>
        <h3 className={styles.cardTitle}>{MONTHS[monthIndex]}</h3>
        <div className={styles.cardBody}>
          {advertisements?.map((ad) => {
            return (
              <div key={ad.id} className={styles.advertisement}>
                <h4 className={styles.advertisementName}>{ad.name}</h4>
                {availableSlots[ad.id || ""] == 0 ? (
                  <p className={styles.filled}>
                    Filled <MdDoneAll />{" "}
                  </p>
                ) : (
                  <p className={styles.availableSlots}>
                    Available slots: {availableSlots[ad.id || ""]} of{" "}
                    {ad.perMonth}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MonthlyView;
