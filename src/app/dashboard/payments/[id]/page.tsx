'use client';

import { Suspense } from "react";
import PaymentForm from "./PaymentForm";
import styles from "./page.module.scss";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";

const PaymentsPage = async ({ params: { id } }: { params: { id: string }}) => {
  if (id === "add") {
    return (
      <section className={styles.container}>
        <PaymentForm paymentId={null} />
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <Suspense fallback={<LoadingSpinner />}>
      <PaymentForm paymentId={id} />
      </Suspense>
    </section>
  );
};

export default PaymentsPage;
