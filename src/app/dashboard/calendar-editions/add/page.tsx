import CalendarForm from "../CalendarForm";
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
      <CalendarForm id={params.id} />
    </section>
  );
};

export default AddAddressBookPage;
