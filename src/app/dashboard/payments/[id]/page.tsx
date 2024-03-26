import PaymentForm from "./PaymentForm";
import styles from "./page.module.scss";

const PaymentsPage = async ({ params }: { params: { id: string} }) => {
  let { id } = params;

  return (
    <section className={styles.container}>
      <PaymentForm id={id === 'add' ? null : id} />
    </section>
  );
};

export default PaymentsPage;
