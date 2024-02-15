import ContactForm from "../../contacts/ContactForm";
import styles from "./page.module.scss";

const UpdateContactPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const { id } = params;

  return (
    <section className={styles.container}>
      <ContactForm
      id={id}
      />
    </section>
  );
};

export default UpdateContactPage;
