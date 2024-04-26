// SlotComponent.jsx
"use client";
import React from "react";
import styles from "./SlotComponent.module.scss";
import { SlotInfo } from "@/lib/data/purchase";

interface SlotProps {
  slotInfo: SlotInfo;
  index: number;
  adIsDayType?: boolean;
}

const SlotComponent: React.FC<SlotProps> = ({
  slotInfo,
  index,
  adIsDayType,
}) => {
  if (adIsDayType) {
    if (!slotInfo.slot) return null;
    return (
      <div className={styles.slot}>
        <span className={styles.slotNumber}>{index + 1}</span>
        <span className={styles.details}>
          {slotInfo.contactCompany ? `${slotInfo.contactCompany} ` : ""}{" "}
          {slotInfo.date && <span className={styles.date}>{`(${slotInfo.date})`}</span>}
        </span>
      </div>
    );
  }
  return (
    <div className={styles.slot}>
      <span className={styles.slotNumber}>{index + 1}</span>{" "}
      <span className={styles.details}>
        {slotInfo.contactCompany ? `${slotInfo.contactCompany}` : ""}
      </span>
    </div>
  );
};

export default SlotComponent;
