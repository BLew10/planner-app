import { getContactById } from "@/lib/data/contact";
import { usePurchasesStore } from "@/store/purchaseStore";
import Purchase from "./Purchase";
import styles from "./page.module.scss";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";

const ContactOverviewPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const contact = await getContactById(id);
  const advertisementTypes = await getAllAdvertisementTypes();

  return (
    <section className={styles.container}>
      <Purchase contact={contact} advertisementTypes={advertisementTypes} />
    </section>
  );
};

export default ContactOverviewPage;
