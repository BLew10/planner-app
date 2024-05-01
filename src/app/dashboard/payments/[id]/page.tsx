import { Suspense } from "react";
import PaymentForm from "./PaymentForm";
import styles from "./page.module.scss";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";
import { getPaymentById } from "@/lib/data/payment";
import { redirect } from "next/navigation";

const PaymentsPage = async ({ params: { id } }: { params: { id: string }}) => {
  if (id === "add") {
    return (
      <section className={styles.container}>
        <PaymentForm payment={null} />
      </section>
    );
  }
  const payment = await getPaymentById(id);
  if (!payment) {
    redirect("/dashboard/payments");
  }

  return (
    <section className={styles.container}>
      <Suspense fallback={<LoadingSpinner />}>
      <PaymentForm payment={payment} />
      </Suspense>
    </section>
  );
};

export default PaymentsPage;
