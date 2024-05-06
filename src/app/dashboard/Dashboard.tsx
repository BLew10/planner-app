"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./Dashboard.module.scss";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import { getAllSlotsByYearAndCalendarId } from "@/lib/data/purchase";
import SelectInput from "../(components)/form/SelectInput";
import { ALL_YEARS } from "@/lib/constants";
import { Advertisement } from "@prisma/client";
import { CalendarEdition } from "@prisma/client";
import LoadingSpinner from "../(components)/general/LoadingSpinner";
import AnimateWrapper from "../(components)/general/AnimateWrapper";
import CalendarInventory from "./CalendarInventory";
import { SlotInfo } from "@/lib/data/purchase";
import CheckboxGroup from "../(components)/form/CheckboxGroup";

const currentYear = new Date().getFullYear();
const selectFirstYear =
  ALL_YEARS.find((year) => year.value === String(currentYear)) || ALL_YEARS[0];
const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState(selectFirstYear.value);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [selectedAdtypes, setSelectedAdtypes] = useState<
    Partial<Advertisement>[]
  >([]);
  const [slotData, setSlotData] = useState<Record<string, SlotInfo[]> | null>(
    null
  );

  const [advertisementTypes, setAdvertisementTypes] = useState<
    Partial<Advertisement>[] | null
  >([]);
  const [calendarData, setCalendarData] = useState<
    Partial<CalendarEdition>[] | null
  >([]);
  const [fetching, setFetching] = useState(true);
  const searchParams = useSearchParams();
  useEffect(() => {
    const fetchFilterData = async () => {
      const calendars = await getAllCalendars();
      setSelectedCalendar(calendars?.[0]?.id || "");
      setCalendarData(calendars || []);
      const ads = await getAllAdvertisementTypes();
      setAdvertisementTypes(ads || []);
      setSelectedAdtypes(ads || []);
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCalendar) return;
      setFetching(true);
      const adtypesIds = selectedAdtypes.map((ad) => ad.id);

      const slots = await getAllSlotsByYearAndCalendarId(
        selectedCalendar,
        selectedYear,
        adtypesIds || []
      );
      setFetching(false);
      setSlotData(slots || null);
    };

    fetchData();
  }, [selectedYear, selectedCalendar, advertisementTypes]);

  useEffect(() => {
    const year = searchParams.get("year");

    if (year) {
      setSelectedYear(year);
    }
  }, [searchParams]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCalendar(e.target.value);
  };

  if (fetching) {
    return <LoadingSpinner />;
  }

  if (!calendarData?.length) {
    return (
      <div className={styles.noCalendars}>
        <p>No Calendars Found. Please create a Calendar Edition.</p>
      </div>
    );
  }
  const filterByAdtype = async (calendarId: string, year: string) => {
    setFetching(true);
    const selectedAds = document.getElementsByName(
      "advertisementTypes"
    ) as NodeListOf<HTMLInputElement>;
    const adTypeIds = Array.from(selectedAds)
      .filter((ad) => ad.checked)
      .map((ad) => ad.value);
    const slots = await getAllSlotsByYearAndCalendarId(
      calendarId,
      year,
      adTypeIds
    );
    setFetching(false);
    const displayedAds = advertisementTypes?.filter((ad) =>
      adTypeIds.includes(ad.id || "")
    );
    setSelectedAdtypes(displayedAds || []);
    setSlotData(slots || null);
  };

  return (
    <AnimateWrapper>
      <div className={styles.container}>
        <div className={styles.printWrapper}>
          <a
            className={styles.printButton}
            href={`/print?year=${selectedYear}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Print Inventory
          </a>
        </div>
        <div className={styles.filterWrapper}>
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
              options={calendarData.map((calendar) => ({
                value: calendar.id,
                label: calendar.name,
              }))}
            />
          </div>
          <div className={styles.checkboxWrapper}>
            <label className={styles.adLabel}>Advertisement Types</label>
            <CheckboxGroup
              name="advertisementTypes"
              options={
                advertisementTypes?.map((ad) => ({
                  label: ad.name,
                  value: ad.id,
                  checked: true,
                })) || []
              }
            />
            <button
              className={styles.submitButton}
              onClick={() => filterByAdtype(selectedCalendar, selectedYear)}
            >
              View
            </button>
          </div>
        </div>
        <CalendarInventory
          slots={slotData}
          advertisementTypes={selectedAdtypes}
        />
      </div>
    </AnimateWrapper>
  );
};

export default Dashboard;
