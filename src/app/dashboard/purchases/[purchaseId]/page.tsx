import PurchaseForm from "./PurchaseForm";
import styles from "./page.module.scss";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { redirect } from "next/navigation";

const PurchaseOverviewPage = async ({
  params,
}: {
  params: { purchaseId: string };
}) => {
  const { purchaseId } = params;

  const advertisementTypes = await getAllAdvertisementTypes();
  const calendars = await getAllCalendars();

  if (!advertisementTypes || advertisementTypes.length === 0) {
    redirect("/dashboard/advertisement-types");
  }

  if (!calendars || calendars.length === 0) {
    redirect("/dashboard/calendars");
  }

  return (
    <section className={styles.container}>
      <PurchaseForm
        advertisementTypes={advertisementTypes}
        purchaseId={purchaseId}
        calendars={calendars}
      />
    </section>
  );
};

export default PurchaseOverviewPage;
