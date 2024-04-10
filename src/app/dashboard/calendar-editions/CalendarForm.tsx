"use client";

import React, { useState, useEffect } from "react";

import styles from "./CalendarForm.module.scss";
import TextInput from "@/app/(components)/form/TextInput";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";

import { getCalendarById } from "@/lib/data/calendarEdition";
import upsertCalendarEdition from "@/actions/calendar-editions/upsertCalendarEdition";
import { CalendarEdition } from "@prisma/client";

interface CalendarFormProps {
  id: string;
}

const CalendarForm = ({ id }: CalendarFormProps) => {
  const [calendar, setCalendar] = useState<Partial<CalendarEdition | null>>();
  useEffect(() => {
    const fetchCalendar = async () => {
      const data = await getCalendarById(id);
      setCalendar(data);
    };

    if (id) {
      fetchCalendar();
    }
  }, [id]);


  return (
    <AnimateWrapper>
      <form action={upsertCalendarEdition} className={styles.form}>
        {calendar && (
          <input type="hidden" name="calendarId" value={calendar.id} />
        )}
        <h2 className={styles.heading}>
          {calendar?.id ? "Edit" : "Add"} Calendar Edition
        </h2>
        <TextInput
          name="name"
          label="Name"
          value={calendar?.name}
          isRequired={true}
          title="Name is required"
        />
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default CalendarForm;
