"use client";

import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.scss";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import { getAdvertisementPurchasesByYearAndCalendarId } from "@/lib/data/purchase";
import SelectInput from "../(components)/form/SelectInput";
import MonthlyView from "./MonthlyView";
import { MONTHS, ALL_YEARS } from "@/lib/constants";
import LoadingSpinner from "../(components)/general/LoadingSpinner";
import AnimateWrapper from "../(components)/general/AnimateWrapper";

const currentYear = new Date().getFullYear();
const selectFirstYear =
  ALL_YEARS.find((year) => year.value === String(currentYear)) || ALL_YEARS[0];
const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState(selectFirstYear.value);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [purchaseData, setPurchaseData] = useState<any>([]);
  const [advertisementTypes, setAdvertisementTypes] = useState<any>([]);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  useEffect(() => {
    const fetchFilterData = async () => {
      const calendars = await getAllCalendars();
      setSelectedCalendar(calendars?.[0]?.id || "");
      setCalendarData(calendars || []);
      const advertisementTypes = await getAllAdvertisementTypes();
      setAdvertisementTypes(advertisementTypes || []);
    };

    fetchFilterData();
  }, []);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(String(e.target.value));
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCalendar(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      const purchases = await getAdvertisementPurchasesByYearAndCalendarId(
        selectedCalendar,
        selectedYear
      );
      setFetching(false);
      setPurchaseData(purchases || []);
    };
    fetchData();
  }, [selectedYear, selectedCalendar]);

  if (!calendarData) {

    return (
      <div className={styles.noCalendars}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!calendarData || calendarData.length === 0) {
    return (
      <div className={styles.noCalendars}>
        <p>No Calendars Found. Please create a Calendar Edition</p>
      </div>
    );
  }

  return (
    <AnimateWrapper>
      <div className={styles.container}>
        <div className={styles.selectWrapper}>
          <SelectInput
            name="year"
            label="Year"
            value={selectedYear}
            onChange={handleYearChange}
            options={ALL_YEARS}
          />
          <SelectInput
            name="calendar"
            label="Calendar"
            value={selectedCalendar}
            onChange={handleCalendarChange}
            options={
              calendarData?.map((calendar: any) => ({
                value: calendar.id,
                label: calendar.name,
              })) || []
            }
          />
        </div>
        {fetching ? (
          <LoadingSpinner />
        ) : (
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
        )}
      </div>
    </AnimateWrapper>
  );
};

export default Dashboard;
