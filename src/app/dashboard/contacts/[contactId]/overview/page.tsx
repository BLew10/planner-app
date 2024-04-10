import ContactOverview from "./ContactOverview";
import styles from "./page.module.scss";

const ContactOverviewPage = async ({
  params,
}: {
  params: { contactId: string };
}) => {
  let  { contactId } = params;
  return (
    <section className={styles.container}>
      <ContactOverview contactId={contactId} />
    </section>
  );
};

export default ContactOverviewPage;
