import { getContactById } from "@/lib/data/contact";
import { getPurchaseById } from "@/lib/data/purchase";
import Purchase from "./Purchase";
import styles from "./page.module.scss";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";

const PurchaseOverviewPage = async ({ params }: { params: { purchaseId: string} }) => {
  const { purchaseId } = params;

  const purchase = await getPurchaseById(purchaseId);
  const advertisementTypes = await getAllAdvertisementTypes();


  return (
    <section className={styles.container}>
      <Purchase advertisementTypes={advertisementTypes} purchase={purchase} />
    </section>
  );
};

export default PurchaseOverviewPage;
