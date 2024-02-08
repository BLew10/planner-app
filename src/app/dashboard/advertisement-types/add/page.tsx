import ATForm from "../ATForm";
import styles from "./page.module.scss";

const AddAddressBookPage = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  return (
    <section className={styles.container}>
      <ATForm id={params.id} />
    </section>
  );
};

export default AddAddressBookPage;
