import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PaymentOverview.module.scss";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { MONTHS } from "@/lib/constants";

const PaymentOverview = () => {
  const paymentOverviewStore = usePaymentOverviewStore();
  const paymentsByYear = paymentOverviewStore.organziePaymentsByYear();

  return (
    <div>
      <h2 className={styles.title}>Payment Overview</h2>
      <div className={styles.infoContainer}>
        <div className={styles.info}>
          <p className={`${styles.infoName} ${styles.totalSale}`}>Total Sale:</p>
          <p className={styles.infoValue}>${paymentOverviewStore.paymentOverview?.totalSale}</p>
        </div>

        {paymentOverviewStore.paymentOverview?.additionalDiscount1 && (
          <div className={styles.info}>
            <p className={styles.infoName}>Additional Discount 1:</p>
            <p className={styles.infoValueDiscount}>
              -${paymentOverviewStore.paymentOverview?.additionalDiscount1}
            </p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.additionalDiscount2 && (
          <div className={styles.info}>
            <p className={styles.infoName}>Additional Discount 2:</p>
            <p className={styles.infoValueDiscount}>
              {" "}
              -${paymentOverviewStore.paymentOverview?.additionalDiscount2}
            </p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.additionalSales1 && (
          <div className={styles.info}>
            <p className={styles.infoName}>Additional Sales 1:</p>
            <p className={styles.infoValueDiscount}>
              -${paymentOverviewStore.paymentOverview?.additionalSales1}
            </p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.additionalSales2 && (
          <div className={styles.info}>
            <p className={styles.infoName}>Additional Sales 2:</p>
            <p className={styles.infoValueDiscount}>
              -${paymentOverviewStore.paymentOverview?.additionalSales2}
            </p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.trade && (
          <div className={styles.info}>
            <p className={styles.infoName}>Trade:</p>
            <p className={styles.infoValueDiscount}>-${paymentOverviewStore.paymentOverview?.trade}</p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.earlyPaymentDiscount && (
          <div className={styles.info}>
            <p className={styles.infoName}>Early Payment Discount:</p>
            <p className={styles.infoValueDiscount}>
              -${paymentOverviewStore.paymentOverview?.earlyPaymentDiscount}
            </p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.earlyPaymentDiscountPercent && (
          <div className={styles.info}>
            <p className={styles.infoName}>Early Payment Discount Percent:</p>
            <p className={styles.infoValueDiscount}>
              -${paymentOverviewStore.paymentOverview?.earlyPaymentDiscountPercent}
            </p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.amountPrepaid && (
          <div className={styles.info}>
            <p className={styles.infoName}>Amount Prepaid:</p>
            <p className={styles.infoValueDiscount}>
              -${paymentOverviewStore.paymentOverview?.amountPrepaid}
            </p>
          </div>
        )}

        <div className={`${styles.info} ${styles.net}`}>
          <p className={styles.infoName}>Net:</p>
          <p className={styles.infoValue}>${paymentOverviewStore.paymentOverview?.net}</p>
        </div>

        {paymentOverviewStore.paymentOverview?.paymentMethod && (
          <div className={styles.info}>
            <p className={styles.infoName}>Payment Method:</p>
            <p className={styles.infoValue}>{paymentOverviewStore.paymentOverview?.paymentMethod}</p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.checkNumber && (
          <div className={styles.info}>
            <p className={styles.infoName}>Check Number:</p>
            <p className={styles.infoValue}>{paymentOverviewStore.paymentOverview?.checkNumber}</p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.lateFee && (
          <div className={styles.info}>
            <p className={styles.infoName}>Late Fee:</p>
            <p className={styles.infoValue}>${paymentOverviewStore.paymentOverview?.lateFee}</p>
          </div>
        )}

        {paymentOverviewStore.paymentOverview?.lateFeePercent && (
          <div className={styles.info}>
            <p className={styles.infoName}>Late Fee Percent:</p>
            <p className={styles.infoValue}>
              {paymentOverviewStore.paymentOverview?.lateFeePercent}%
            </p>
          </div>
        )}
      </div>
      {Object.keys(paymentsByYear).map((year) => (
        <div key={year} className={styles.tableWrapper}>
          <h3 className={styles.year}>{year}</h3>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Amount</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentsByYear[year as any].map((payment) => (
                <tr key={formatDateToString(payment.dueDate)}>
                  <td>{MONTHS[payment.month - 1]}</td>
                  <td>${Number(payment.amount).toFixed(2)}</td>
                  <td>{formatDateToString(payment.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default PaymentOverview;
