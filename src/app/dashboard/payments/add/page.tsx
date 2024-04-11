'use client';

import { Suspense } from "react";
import PaymentForm from "./PaymentForm";
import styles from "./page.module.scss";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";

const PaymentsPage = async () => {

  return (
    <section className={styles.container}>
      <Suspense fallback={<LoadingSpinner />}>
      <PaymentForm  />
      </Suspense>
    </section>
  );
};

export default PaymentsPage;
