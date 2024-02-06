import ContactForm from "../ContactForm";
import styles from "./page.module.scss";

const AddAddressBookPage = () => {
  return (
    <section className={styles.container}>
      <ContactForm/>
    </section>
  );
};

export default AddAddressBookPage;
