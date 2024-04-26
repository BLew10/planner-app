'use client';
import React from "react";
import styles from "./CalendarInventory.module.scss";
import { SlotInfo } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import AdvertisementRow from "./AdvertisementRow";

interface CalendarInventoryProps {
    slots: Record<string, SlotInfo[]> | null;
    advertisementTypes: Partial<Advertisement>[] | null;
}

const CalendarInventory: React.FC<CalendarInventoryProps> = ({ slots, advertisementTypes }) => {
    return (
        <div className={styles.container}>
            {advertisementTypes?.map((type) => (
                <AdvertisementRow
                    key={type.id || ''}
                    slots={type.id && slots ? slots[type.id] : []}  // Pass only the slots for the current ad type
                    adType={type}
                />
            ))}
        </div>
    );
}

export default CalendarInventory;
