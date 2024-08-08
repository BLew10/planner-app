import { useEffect, useState } from "react";
import {
  getScheduledPaymentsByContactIdAndYear,
  updateSchedulePaymentLateFeesByYear,
} from "@/lib/data/scheduledPayment";
import styles from "./ContactScheduledPayments.module.scss";
import SelectInput from "@/app/(components)/form/SelectInput";
import CheckboxInput from "@/app/(components)/form/CheckboxInput";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { ALL_YEARS } from "@/lib/constants";
import { ScheduledPayment } from "@prisma/client";
import { toast, ToastContainer } from "react-toastify";

const nextYear = String(new Date().getFullYear() + 1);

interface ContactScheduledPaymentsProps {
  contactId: string;
}
const ContactPurchasesOverview = ({
  contactId,
}: ContactScheduledPaymentsProps) => {
  const [selectedYear, setSelectedYear] = useState<string>(nextYear);
  const [scheduledPayments, setScheduledPayments] = useState<
    ScheduledPayment[] | null
  >([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  useEffect(() => {
    const fetchScheduledPayments = async () => {
      const payments = await getScheduledPaymentsByContactIdAndYear(
        contactId,
        selectedYear
      );
      setScheduledPayments(payments);
    };

    fetchScheduledPayments();
  }, [selectedYear]);

  useEffect(() => {
    const waivedFees: string[] = [];
    scheduledPayments?.forEach((payment) => {
      if (payment.lateFeeWaived) {
        waivedFees.push(payment.id);
      }
    });

    setSelectedPayments(waivedFees);
  }, [scheduledPayments]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const paymentId = event.target.value;
    if (event.target.checked) {
      setSelectedPayments([...selectedPayments, paymentId]);
    } else {
      setSelectedPayments(
        selectedPayments.filter((payment) => payment !== paymentId)
      );
    }
  };

  const onSubmit = async () => {
    const result = await updateSchedulePaymentLateFeesByYear(
      selectedPayments,
      selectedYear
    );
    if (result) {
      toast.success("Change successfully saved!");
    } else {
      toast.error("Failed to waive late fees! Please try again.");
    }
  };

  return (
    <div className={styles.contactPurchases}>
      <ToastContainer />
      <div className={styles.header}>
        <h2 className={styles.groupHeader}>Scheduled Payments</h2>
        <SelectInput
          label=""
          options={ALL_YEARS}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          name="year"
        />
      </div>
      <AnimateWrapper>
        <div className={styles.contactPurchases}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Amount Paid</th>
                <th>Status</th>
                <th>Waive Late Fee?</th>
              </tr>
            </thead>
            <tbody>
              {scheduledPayments?.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.dueDate}</td>
                  <td>${Number(payment.amount).toFixed(2)}</td>
                  <td>${Number(payment.amountPaid).toFixed(2)}</td>
                  <td className={`${payment.isLate ? styles.late : ""}`}>
                    {payment.isLate ? "Late" : "On Time"}
                  </td>
                  <td>
                    <CheckboxInput
                      name="waiveLateFee"
                      value={payment.id}
                      checked={selectedPayments.includes(payment.id)}
                      onChange={handleCheckboxChange}
                      label=""
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className={styles.button} onClick={onSubmit}>
          Submit
        </button>
      </AnimateWrapper>
    </div>
  );
};

export default ContactPurchasesOverview;
