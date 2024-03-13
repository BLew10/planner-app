import { getContactById } from "@/lib/data/contact";
import { getPurchaseById } from "@/lib/data/purchase";
import Purchase from "./Purchase";
import styles from "./page.module.scss";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";

const ContactOverviewPage = async ({ params }: { params: { contactId: string, purchaseId: string} }) => {
  const { contactId, purchaseId } = params;

  const contact = await getContactById(contactId);
  const purchase = await getPurchaseById(purchaseId, contactId);
  const advertisementTypes = await getAllAdvertisementTypes();


  return (
    <section className={styles.container}>
      <Purchase contact={contact} advertisementTypes={advertisementTypes} purchase={purchase} />
    </section>
  );
};

export default ContactOverviewPage;
