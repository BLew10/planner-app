import ContactForm from "../ContactForm";
import styles from "./page.module.scss";

const AddAddressBookPage = ({ params }: { params: { id: string } }) => {
  return (
    <section className={styles.container}>
      <ContactForm id={params.id} />
    </section>
  );
};

export default AddAddressBookPage;
