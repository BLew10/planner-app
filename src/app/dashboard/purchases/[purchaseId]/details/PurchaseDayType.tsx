import React, { useState } from "react";
import { AdvertisementPurchaseModel } from "@/lib/models/advertisementPurchase";
import Calendar from "react-calendar";
import styles from "./PurchaseDayType.module.scss";
import "react-calendar/dist/Calendar.css";

interface PurchaseDayTypeProps {
  year: number;
  month: number;
  purchase: Partial<AdvertisementPurchaseModel> | null;
}

const PurchaseDayType: React.FC<PurchaseDayTypeProps> = ({
  purchase,
  year,
  month,
}) => {
  const [selectedDays, setSelectedDays] = useState<Date[]>(() =>
    purchase?.adPurchaseSlots
      ? purchase.adPurchaseSlots
          .filter((slot) => slot.date)
          .map((slot) => new Date(slot.date as string))
      : []
  );
  const [activeStartDate, setActiveStartDate] = useState(new Date(year, month));

  const handleDaySelect = (date: Date) => {
    const isSelected = selectedDays.some(
      (selectedDate) => selectedDate.getTime() === date.getTime()
    );
    if (isSelected) {
      setSelectedDays(
        selectedDays.filter(
          (selectedDate) => selectedDate.getTime() !== date.getTime()
        )
      );
    } else {
      setSelectedDays([...selectedDays, date]);
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const isSelected = selectedDays.some(
        (selectedDate) =>
          selectedDate.getDate() === date.getDate() &&
          selectedDate.getMonth() === date.getMonth() &&
          selectedDate.getFullYear() === date.getFullYear()
      );
      return isSelected ? styles.selectedDay : "";
    }
  };
  
  let slotIndex = 0;

  console.log('purchase?.adPurchaseSlots', purchase?.adPurchaseSlots);
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      slotIndex++
      let isSelected = selectedDays.some((selectedDate) => selectedDate.getTime() === date.getTime() && month === date.getMonth());
      const value = date.getMonth() === month ? date.toLocaleDateString() : "";
      if (!isSelected) {
        isSelected = purchase?.adPurchaseSlots?.some(s => s.slot === slotIndex/2 && s.month === month + 1) || false;
      }

      return (
        <input
          type="checkbox"
          name={`adid-${purchase?.advertisementId}-month-${month + 1}`}
          value={value ||  slotIndex/2}
          defaultChecked={isSelected}
          className={styles.checkbox}
        />
      );
    }
    return null;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return (
    <div className={styles.container}>
      <h3 className={styles.monthName}>{monthNames[month]}</h3>
      <Calendar
        activeStartDate={activeStartDate}
        onClickDay={handleDaySelect}
        tileClassName={tileClassName}
        tileContent={tileContent}
        calendarType="gregory"
        view="month"
        showNavigation={false}
        showFixedNumberOfWeeks={true}
        formatShortWeekday={(locale, date) =>
          ["S", "M", "T", "W", "T", "F", "S"][date.getDay()]
        }
      />
    </div>
  );
};

export default PurchaseDayType;
