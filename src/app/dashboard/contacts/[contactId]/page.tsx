import ContactForm from "./ContactForm";
import styles from "./page.module.scss";

const UpdateContactPage = async ({
  params,
}: {
  params: { contactId: string };
}) => {
  let  { contactId } = params;

  return (
    <section className={styles.container}>
      <ContactForm id={contactId === 'add' ? null : contactId} />
    </section>
  );
};

export default UpdateContactPage;
