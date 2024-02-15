import PurchaseDetails from "./PurchaseDetails";
import styles from "./page.module.scss";
import { getAllCalendars } from "@/lib/data/calendarEdition";


const PurchaseDetailsPage = async () => {
  const calendars = await getAllCalendars();
  return (
    <section className={styles.container}>
      <PurchaseDetails calendars={calendars}  />
    </section>
  );
};

export default PurchaseDetailsPage;
