"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import deleteCalendar from "@/actions/calendar-editions/deleteCalendarEdition";
import { CalendarEdition } from "@prisma/client";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { toast, ToastContainer } from "react-toastify";

const columns = [
  {
    name: "Name",
    size: "default",
  },
  {
    name: "Code",
    size: "default",
  },
  {
    name: "Actions",
    size: "default",
  },
];

const CalendarsPage = () => {
  const [calendars, setCalendars] = useState<Partial<CalendarEdition>[] | null>(
    []
  );
  const successNotify = () => toast.success("Successfully Deleted");
  const errorNotify = () =>
    toast.error("Something went wrong. Deletion failed");

  const fetchCalendars = async () => {
    const calendars = await getAllCalendars();
    setCalendars(calendars);
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  const onCalendarDelete = async (adTypeId?: string) => {
    const deleted = await deleteCalendar(adTypeId || "-1");
    await fetchCalendars();
    if (deleted) {
      successNotify();
    } else {
      errorNotify();
    }
  };

  const data = calendars?.map((c) => {
    return [
      c.name,
      c.code,
      <div className={styles.modWrapper} key={c.id}>
        <Link
          href={`/dashboard/calendar-editions/${c.id}`}
          className={styles.editAction}
        >
          Edit
        </Link>
        <DeleteButton
          title="Delete Calendar"
          onDelete={() => onCalendarDelete(c.id)}
          text={`Are you sure you want to delete ${c.name}?`}
        />
      </div>,
    ];
  });

  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <ToastContainer />
        <Table
          tableName="Calendar Editions"
          columns={columns}
          data={data}
          addPath={"/dashboard/calendar-editions/add"}
        />
      </section>
    </AnimateWrapper>
  );
};

export default CalendarsPage;
