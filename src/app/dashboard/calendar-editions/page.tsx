import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import deleteCalendar from "@/actions/calendar-editions/deleteCalendarEdition";

const CalendarsPage = async () => {
  const calendars = await getAllCalendars();
  console.log(calendars);

  const columns = [
    {
      name: "Name",
      size: "default",
    },
    {
      name: "Actions",
      size: "default",
    },
  ];

  const data = calendars?.map((c) => {
    return [
      c.name,
      <div className={styles.modWrapper}>
        <Link
          href={`/dashboard/calendar-types/${c.id}`}
          className={styles.editAction}
        >
          Edit
        </Link>
        <form action={deleteCalendar}>
          <button type="submit" className={styles.deleteAction}>
            Delete
          </button>
          <input type="hidden" name="calendarId" value={c.id} />
        </form>
      </div>,
    ];
  });

  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <Table tableName="Calendar Editions" columns={columns} data={data} addPath={'/dashboard/calendar-editions/add'} />
      </section>
    </AnimateWrapper>
  );
};

export default CalendarsPage;
