import ContactForm from "../../advertisement-types/ATForm";
import styles from "./page.module.scss";

const UpdateAddressBookPage = async ({
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

export default UpdateAddressBookPage;
