import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PaymentOverview.module.scss";
import { usePaymentStore } from "@/store/paymentStore";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { MONTHS } from "@/lib/constants";
import { toast } from "react-toastify";
import { upsertPayment } from "@/actions/payments/upsertPayment";

interface PaymentOverviewProps {
  year: string | undefined;
}
const PaymentOverview = ({ year }: PaymentOverviewProps) => {
  const { paymentOverview, organziePaymentsByYear } = usePaymentStore();
  const paymentsByYear = organziePaymentsByYear();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!paymentsByYear) return null;

  const onSubmit = async () => {
    if (!paymentOverview) {
      return;
    }
    setIsSubmitting(true);
    const successs = await upsertPayment(paymentOverview);
    setIsSubmitting(false);
    if (successs) {
      toast.success("Payment updated successfully");

    router.push("/dashboard?year=" + year);
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <h2 className={styles.title}>Payment Overview</h2>
      <div className={styles.infoContainer}>
        <div className={styles.info}>
          <p className={styles.infoName}>Net:</p>
          <p className={styles.infoValue}>${paymentOverview?.net}</p>
        </div>
        <div className={styles.info}>
          <p className={styles.infoName}>Total Sale:</p>
          <p className={styles.infoValue}>${paymentOverview?.totalSale}</p>
        </div>

        {paymentOverview.additionalDiscount1 && (
          <div className={styles.info}>
            <p className={styles.infoName}>Additional Discount 1:</p>
            <p className={styles.infoValue}>
              ${paymentOverview?.additionalDiscount1}
            </p>
          </div>
        )}

        {paymentOverview.additionalDiscount2 && (
          <div className={styles.info}>
            <p className={styles.infoName}>Additional Discount 2:</p>
            <p className={styles.infoValue}>
              {" "}
              ${paymentOverview?.additionalDiscount2}
            </p>
          </div>
        )}

        {paymentOverview.additionalSales1 && (
          <div className={styles.info}>
            <p className={styles.infoName}>Additional Sales 1:</p>
            <p className={styles.infoValue}>
              ${paymentOverview?.additionalSales1}
            </p>
          </div>
        )}

        {paymentOverview.additionalSales2 && (
          <div className={styles.info}>
            <p className={styles.infoName}>Additional Sales 2:</p>
            <p className={styles.infoValue}>
              ${paymentOverview?.additionalSales2}
            </p>
          </div>
        )}

        {paymentOverview.trade && (
          <div className={styles.info}>
            <p className={styles.infoName}>Trade:</p>
            <p className={styles.infoValue}>${paymentOverview?.trade}</p>
          </div>
        )}

        {paymentOverview.earlyPaymentDiscount && (
          <div className={styles.info}>
            <p className={styles.infoName}>Early Payment Discount:</p>
            <p className={styles.infoValue}>
              ${paymentOverview?.earlyPaymentDiscount}
            </p>
          </div>
        )}

        {paymentOverview.earlyPaymentDiscountPercent && (
          <div className={styles.info}>
            <p className={styles.infoName}>Early Payment Discount Percent:</p>
            <p className={styles.infoValue}>
              ${paymentOverview?.earlyPaymentDiscountPercent}
            </p>
          </div>
        )}

        {paymentOverview.amountPrepaid && (
          <div className={styles.info}>
            <p className={styles.infoName}>Amount Prepaid:</p>
            <p className={styles.infoValue}>
              ${paymentOverview?.amountPrepaid}
            </p>
          </div>
        )}

        {paymentOverview.paymentMethod && (
          <div className={styles.info}>
            <p className={styles.infoName}>Payment Method:</p>
            <p className={styles.infoValue}>{paymentOverview?.paymentMethod}</p>
          </div>
        )}

        {paymentOverview.checkNumber && (
          <div className={styles.info}>
            <p className={styles.infoName}>Check Number:</p>
            <p className={styles.infoValue}>{paymentOverview?.checkNumber}</p>
          </div>
        )}

        {paymentOverview.lateFee && (
          <div className={styles.info}>
            <p className={styles.infoName}>Late Fee:</p>
            <p className={styles.infoValue}>${paymentOverview?.lateFee}</p>
          </div>
        )}

        {paymentOverview.lateFeePercent && (
          <div className={styles.info}>
            <p className={styles.infoName}>Late Fee Percent:</p>
            <p className={styles.infoValue}>
              {paymentOverview?.lateFeePercent}%
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
                  <td>${payment.amount}</td>
                  <td>{formatDateToString(payment.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <button className={styles.submitButton} onClick={onSubmit}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
};

export default PaymentOverview;
