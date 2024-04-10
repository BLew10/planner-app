import PaymentForm from "./PaymentForm";
import styles from "./page.module.scss";

const PaymentsPage = async () => {

  return (
    <section className={styles.container}>
      <PaymentForm  />
    </section>
  );
};

export default PaymentsPage;
