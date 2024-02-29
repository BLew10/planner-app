import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import deleteCalendar from "@/actions/calendar-editions/deleteCalendarEdition";

const PurchasesPage = async () => {
  const purhcases = await getAllCalendars();

  const columns = [
    {
      name: "Contact",
      size: "default",
    },
    {
      name: "Status",
      size: "default",
    },
    {
      name: "Actions",
      size: "default",
    },
  ];

  const data = purhcases?.map((p) => {
    return [
      p.name,
      <div className={styles.modWrapper}>
        <Link
          href={`/dashboard/purchases/${p.id}`}
          className={styles.editAction}
        >
          Edit
        </Link>
        <form action={deleteCalendar}>
          <button type="submit" className={styles.deleteAction}>
            Delete
          </button>
          <input type="hidden" name="purchaseId" value={p.id} />
        </form>
      </div>,
    ];
  });

  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <Table tableName="Calendar Editions" columns={columns} data={data} addPath={'/dashboard/purchases/add'} />
      </section>
    </AnimateWrapper>
  );
};

export default PurchasesPage;
