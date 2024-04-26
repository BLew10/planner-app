"use client";
import React, { useEffect, useState } from "react";
import PrintInventory from "./PrintInventory";
import styles from "./page.module.scss";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import { CalendarEdition, Advertisement } from "@prisma/client";
import CheckboxGroup from "../(components)/form/CheckboxGroup";
import SelectInput from "../(components)/form/SelectInput";
import { ALL_YEARS } from "@/lib/constants";
import useDarkMode from "@/hooks/useDarkMode";
import { useSearchParams } from "next/navigation";

export default function PrintCalendarInventoryPage() {
  const [calendars, setCalendars] = useState<Partial<CalendarEdition>[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<
    Partial<CalendarEdition>[]
  >([]);
  const [ads, setAds] = useState<Partial<Advertisement>[]>([]);
  const [selectedAds, setSelectedAds] = useState<Partial<Advertisement>[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [year, setYear] = useState(ALL_YEARS[0].value);
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      const calendars = await getAllCalendars();
      const ads = await getAllAdvertisementTypes();
      setCalendars(calendars || []);
      setSelectedCalendars(calendars || []);
      setAds(ads || []);
      setSelectedAds(ads || []);
    };
    fetchData();
    setIsDarkMode(false);

    const year = searchParams.get("year") || ALL_YEARS[0].value;
    if (isValidYear(year)) {
      setYear(year);
    }
  }, []);

  const isValidYear = (year: string) => {
    return year.length === 4 && !isNaN(Number(year));
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === "calendars") {
      const calendar = calendars.find((c) => c.id === e.target.value);
      if (calendar) {
        setSelectedCalendars((prevSelectedCalendars) => {
          if (checked) {
            return [...prevSelectedCalendars, calendar];
          } else {
            return prevSelectedCalendars.filter((c) => c.id !== calendar.id);
          }
        });
      }
    } else if (name === "ads") {
      const ad = ads.find((a) => a.id === e.target.value);
      if (ad) {
        setSelectedAds((prevSelectedAds) => {
          if (checked) {
            return [...prevSelectedAds, ad];
          } else {
            return prevSelectedAds.filter((a) => a.id !== ad.id);
          }
        });
      }
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
  };

  const getFilteredData = async () => {
    setShowFilters(false);
  };

  const handleToggleCalendars = () => {
    if (selectedCalendars.length === calendars.length) {
      setSelectedCalendars([]);
    } else {
      setSelectedCalendars(calendars);
    }
  };

  const handleToggleAds = () => {
    if (selectedAds.length === ads.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(ads);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Print Calendar Inventory</h1>
      {!showFilters && (
        <button onClick={() => setShowFilters(true)} className={styles.button}>
          Reset
        </button>
      )}
      {showFilters ? (
        <div className={styles.filters}>
          <div className={styles.yearWrapper}>
            <SelectInput
              name="year"
              label="Year"
              options={ALL_YEARS}
              onChange={handleYearChange}
              value={year}
            />
          </div>
          <div className={styles.calendarsWrapper}>
            <div className={styles.header}>
              <h1 className={styles.title}>Calendars</h1>
              <button
                onClick={handleToggleCalendars}
                className={styles.toggleAllButton}
              >
                {selectedCalendars.length === calendars.length ? "Deselect All Calendars" : "Select All Calendars"}
              </button>
            </div>
            <CheckboxGroup
              name="calendars"
              options={calendars.map((c) => ({
                value: c.id,
                label: c.name,
                checked: selectedCalendars.some((sc) => sc.id === c.id),
              }))}
              onChange={handleOnChange}
              useGrid={false}
            />
          </div>
          <div className={styles.adsWrapper}>
            <div className={styles.header}>
              <h1 className={styles.title}>Advertisement Types</h1>
              <button
                onClick={handleToggleAds}
                className={styles.toggleAllButton}
              >
                 {selectedAds.length === ads.length ? "Deselect All Ad Types" : "Select All Ad Types"}
              </button>
            </div>
            <CheckboxGroup
              name="ads"
              options={ads.map((a) => ({
                value: a.id,
                label: a.name,
                checked: selectedAds.some((sa) => sa.id === a.id),
              }))}
              useGrid={false}
              onChange={handleOnChange}
            />
          </div>
          <button
            onClick={getFilteredData}
            className={styles.button}
            disabled={
              !selectedCalendars ||
              selectedCalendars.length === 0 ||
              !selectedAds ||
              selectedAds.length === 0
            }
          >
            Get Filtered Data
          </button>
        </div>
      ) : (
        selectedCalendars &&
        selectedCalendars.length > 0 &&
        selectedCalendars.map((calendar) => (
          <section key={calendar.id}>
            <PrintInventory
              calendar={calendar}
              year={year}
              advertisementTypes={selectedAds}
            />
          </section>
        ))
      )}
    </div>
  );
}
