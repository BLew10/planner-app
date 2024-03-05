"use client";

import React, {useState, useEffect} from "react";
import styles from "./Dashboard.module.scss";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import { getAdvertisementPurchasesByYearAndCalendarId } from "@/lib/data/purchase";
import SelectInput from "../(components)/form/SelectInput";
import MonthlyView from "./MonthlyView";
import { MONTHS } from "@/lib/constants";

const YEARS = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i);

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState(YEARS[0]);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [purchaseData, setPurchaseData] = useState<any>([]);
  const [advertisementTypes, setAdvertisementTypes] = useState<any>([]);
  const [calendarData, setCalendarData] = useState<any>([]);
  const [fetching, setFetching] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const calendars = await getAllCalendars();
      setSelectedCalendar(calendars?.[0]?.id || "");
      setCalendarData(calendars || []);

      const advertisementTypes = await getAllAdvertisementTypes();
      setAdvertisementTypes(advertisementTypes || []);
    };

    fetchData();
  }, []);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCalendar(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const purchases = await getAdvertisementPurchasesByYearAndCalendarId(
        selectedCalendar,
        selectedYear
      );
      setPurchaseData(purchases || []);
    };

    fetchData();
  }, [selectedYear, selectedCalendar]);

  console.log('purchasedata', purchaseData);

  return (
    <div className={styles.container}>
      <div className={styles.selectWrapper}>
        <SelectInput
          name="year"
          label="Year"
          value={String(YEARS[0])}
          onChange={handleYearChange}
          options={YEARS.map((year) => ({
            value: String(year),
            label: String(year),
          }))}
        />
        <SelectInput
          name="calendar"
          label="Calendar"
          value={calendarData?.[0]?.id || ""}
          onChange={handleCalendarChange}
          options={
            calendarData?.map((calendar: any) => ({
              value: calendar.id,
              label: calendar.name,
            })) || []
          }
        />
      </div>
      <div className={styles.monthGrid}>
        {purchaseData &&
          MONTHS.map((month, index) => (
            <MonthlyView
              key={month}
              monthIndex={index}
              purchaseData={purchaseData[index + 1] || null}
              advertisements={advertisementTypes}
              calendarId={selectedCalendar}
              year={selectedYear}
            />
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
