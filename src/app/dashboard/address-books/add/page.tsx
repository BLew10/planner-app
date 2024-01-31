import AddressBookForm from "../AddressBookForm";
import styles from "./page.module.scss";

const AddAddressBookPage = () => {
  return (
    <section className={styles.container}>
      <AddressBookForm addressBookName="" displayLevel="" />
    </section>
  );
};

export default AddAddressBookPage;
