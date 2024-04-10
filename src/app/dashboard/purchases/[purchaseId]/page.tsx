import { getPurchaseById } from "@/lib/data/purchase";
import PurchaseForm from "./PurchaseForm";
import styles from "./page.module.scss";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";

const PurchaseOverviewPage = async ({ params }: { params: { purchaseId: string} }) => {
  const { purchaseId } = params;

  const purchase = await getPurchaseById(purchaseId);
  const advertisementTypes = await getAllAdvertisementTypes();


  return (
    <section className={styles.container}>
      <PurchaseForm advertisementTypes={advertisementTypes} purchase={purchase} />
    </section>
  );
};

export default PurchaseOverviewPage;
