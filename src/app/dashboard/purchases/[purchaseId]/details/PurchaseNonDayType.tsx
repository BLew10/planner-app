"use client";

import React from "react";
import { AdvertisementPurchaseModel } from "@/lib/models/advertisementPurchase";
import styles from "./PurchaseNonDayType.module.scss";
import CheckboxGroup from "@/app/(components)/form/CheckboxGroup";

interface PurchaseNonDayTypeProps {
  purchase: Partial<AdvertisementPurchaseModel> | null;
}

const PurchaseNonDayType = ({ purchase }: PurchaseNonDayTypeProps) => {
  const monthGroups = Array.from({ length: 12 }).map((_, monthIndex) => {
    const options = Array.from({ length: Number(purchase?.advertisement?.perMonth) || 0 }).map(
      (_, index) => 

      ({
        label: `${index + 1}`,
        value: "",
        checked: purchase?.adPurchaseSlots?.some((slot) => slot.month === monthIndex+1 && slot.slot === index + 1) || false,
      })
    );

    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

    return (
      <div key={monthIndex}>
        <h4 className={styles.text}>{monthNames[monthIndex]}</h4>
        <CheckboxGroup name={`adid-${purchase?.advertisementId}-month-${monthIndex+1}`} options={options} useGrid={false}/>
      </div>
    );
  });

  return <>{monthGroups}</>;
};

export default PurchaseNonDayType;
