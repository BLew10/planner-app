import React, { useState } from "react";
import { Purchase } from "@/store/purchaseStore";
import Calendar from "react-calendar";
import styles from "./PurchaseDayType.module.scss";
import "react-calendar/dist/Calendar.css";

interface PurchaseDayTypeProps {
  year: number;
  month: number;
  purchase: Partial<Purchase> | null;
}

const PurchaseDayType: React.FC<PurchaseDayTypeProps> = ({
  purchase,
  year,
  month,
}) => {
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
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

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const isSelected = selectedDays.some(
        (selectedDate) => selectedDate.getTime() === date.getTime()
      );
      return (
        <input
          type="checkbox"
          name={`adid-${purchase?.advertisementId}-month-${month + 1}`}
          checked={isSelected}
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
        onActiveStartDateChange={({ activeStartDate }) =>
          setActiveStartDate(new Date(year, month))
        }
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
