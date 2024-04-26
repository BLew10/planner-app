import React, { useEffect, useState } from "react";
import styles from "./PaymentSchedule.module.scss";
import { usePaymentStore } from "@/store/paymentStore";
import { MONTHS } from "@/lib/constants";
import CheckboxInput from "@/app/(components)/form/CheckboxInput";
import MoneyInput from "@/app/(components)/form/MoneyInput";
import { ScheduledPayment } from "@/store/paymentStore";
import { toast } from "react-toastify";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const nextThreeYears = [currentYear, currentYear + 1, currentYear + 2];

interface PaymentScheduleProps {
  onNext: () => void;
}

interface ScheduledPaymentData extends ScheduledPayment {
  isChecked?: boolean | null;
}
const PaymentSchedule = ({ onNext }: PaymentScheduleProps) => {
  const paymentStore = usePaymentStore();
  const [splitPaymentsEqually, setSplitPaymentsEqually] = useState<boolean>(
    paymentStore.paymentOverview.splitPaymentsEqually ?? true
  );

  useEffect(() => {
    const payments: ScheduledPayment[] = [];
    nextThreeYears.forEach((year) => {
      MONTHS.forEach((_, monthIndex) => {
        if (!(year === currentYear && monthIndex < currentMonth)) {
          const dueDate = generateDueDates(year, monthIndex);
          const payment = paymentStore.paymentOverview.scheduledPayments?.find(
            (p) => p.month === monthIndex + 1 && p.year === year
          );
          if (paymentStore.paymentOverview.scheduledPayments && payment) {
            payments.push({ ...payment, dueDate });
          }
        }
      });
    });
    paymentStore.updateKeyValue("scheduledPayments", payments);
  }, [paymentStore.paymentOverview.net]);

  function getLastDayOfMonth(year: number, month: number) {
    return new Date(year, month + 1, 0); // Month is 0-indexed, 0 day is the last day of the previous month
  }

  function getSpecificDayOfMonth(year: number, month: number, day: number) {
    const lastDay = getLastDayOfMonth(year, month).getDate();
    return new Date(year, month, Number(day) > lastDay ? lastDay : day);
  }

  /**
   * Generates due dates based on the payment overview configuration.
   */
  function generateDueDates(year: number, month: number) {
    if (paymentStore.paymentOverview.paymentOnLastDay) {
      return getLastDayOfMonth(year, month);
    } else if (paymentStore.paymentOverview.paymentDueOn) {
      return getSpecificDayOfMonth(
        year,
        month,
        paymentStore.paymentOverview.paymentDueOn
      );
    }
    return new Date(year, month, 1); // Default to the first of the month if no settings provided
  }

  const handleSplitPaymentsEquallyChange = (splitEqually: boolean) => {
    setSplitPaymentsEqually(splitEqually);
    paymentStore.updateKeyValue("splitPaymentsEqually", splitEqually);
    paymentStore.updateKeyValue("scheduledPayments", []);
  };

  const onSubmit = async () => {
    const totalNet = paymentStore.paymentOverview.net || 0;
    let payments: ScheduledPayment[] | null = [];

    if (splitPaymentsEqually) {
      const equalAmount =
        Math.round(
          (totalNet / paymentStore.paymentOverview.scheduledPayments.length) *
            100
        ) / 100;
      payments = paymentStore.paymentOverview.scheduledPayments?.map(
        (payment) => ({
          ...payment,
          amount: equalAmount,
        })
      );
    } else {
      payments =
        paymentStore.paymentOverview.scheduledPayments?.filter(
          (p) => p.amount !== null && !isNaN(p.amount as number)
        ) || null;
    }

    if (!payments) {
      toast.error("Please enter a valid amount for each payment");
      return;
    }

    // Verify that the total payments equal the net amount
    let totalPaymentsAmount =
      payments?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    if (totalPaymentsAmount !== totalNet) {
      const lastPaymentIndex = payments.length - 1;
      const overage = totalPaymentsAmount - totalNet;
      payments[lastPaymentIndex].amount =
        (payments[lastPaymentIndex].amount || 0) - overage; // adds or subtracts from the last payment
      totalPaymentsAmount -= overage; // Recalculate the total after adjustment
    }

    if (totalPaymentsAmount === totalNet) {
      paymentStore.updateKeyValue("scheduledPayments", payments);
      onNext();
    } else {
      toast.error("Total payments do not match the net amount");
    }
  };

  const handleCheckboxChange = (
    month: number,
    year: number,
    isChecked: boolean
  ) => {
    const index = paymentStore.paymentOverview.scheduledPayments?.findIndex(
      (p) => p.month === month && p.year === year
    );
    if (index !== -1 && !isChecked) {
      const updatedPayments = [
        ...paymentStore.paymentOverview.scheduledPayments,
      ];
      updatedPayments.splice(index, 1);
      paymentStore.updateKeyValue("scheduledPayments", updatedPayments);
    } else if (!index || (index === -1 && isChecked)) {
      const updatedPayments = [
        ...(paymentStore.paymentOverview.scheduledPayments || []),
        { month, year, amount: null, dueDate: generateDueDates(year, month) },
      ];
      paymentStore.updateKeyValue("scheduledPayments", updatedPayments);
    }
  };

  const handleInputChange = (
    month: number,
    year: number,
    amount: number | null
  ) => {
    const index = paymentStore.paymentOverview.scheduledPayments?.findIndex(
      (p) => p.month === month && p.year === year
    );
    if (index !== -1 && amount) {
      const updatedPayments = [
        ...paymentStore.paymentOverview.scheduledPayments,
      ];
      updatedPayments[index] = { ...updatedPayments[index], amount };
      paymentStore.updateKeyValue("scheduledPayments", updatedPayments);
    } else if ((!index && amount) || (index === -1 && amount)) {
      const updatedPayments = [
        ...paymentStore.paymentOverview.scheduledPayments,
        { month, year, amount, dueDate: generateDueDates(year, month) },
      ];
      paymentStore.updateKeyValue("scheduledPayments", updatedPayments);
    }
  };

  return (
    <section>
      <h2 className={styles.title}>Payment Schedule</h2>
      <p className={styles.description}>
        Select how you want to split the total of{" "}
        <span className={styles.net}>${paymentStore.paymentOverview.net}</span>
      </p>
      <div className={styles.splitPayments}>
        <div className={styles.radioGroup}>
          <input
            type="radio"
            name="payment-schedule"
            checked={splitPaymentsEqually}
            onChange={() => handleSplitPaymentsEquallyChange(true)}
          />
          <label>Split payments equally</label>
        </div>
        <div className={styles.radioGroup}>
          <input
            type="radio"
            name="payment-schedule"
            checked={!splitPaymentsEqually}
            onChange={() => handleSplitPaymentsEquallyChange(false)}
          />
          <label>Enter custom monthly amounts</label>
        </div>
      </div>
      <div className={styles.paymentSchedule}>
        {nextThreeYears.map((year, i) => (
          <div key={year} className={styles.year}>
            <p className={styles.yearText}>{year}</p>
            <div className={styles.months}>
              {MONTHS.map((month, index) => {
                if (year === currentYear && index <= currentMonth) {
                  return null;
                }
                return (
                  <div key={`${year}-${month}`} className={styles.month}>
                    {splitPaymentsEqually ? (
                      <CheckboxInput
                        labelLocation="top"
                        name="payment-schedule"
                        label={MONTHS[index]}
                        onChange={(e) =>
                          handleCheckboxChange(
                            index + 1,
                            year,
                            e.target.checked
                          )
                        }
                        checked={paymentStore.paymentOverview.scheduledPayments?.some(
                          (p) => p.month === index + 1 && p.year === year
                        )}
                      />
                    ) : (
                      <MoneyInput
                        name="payment-amount"
                        type="text"
                        label={MONTHS[index]}
                        onChange={(e) =>
                          handleInputChange(
                            index + 1,
                            year,
                            Number(e.target.value)
                          )
                        }
                        value={
                          paymentStore.paymentOverview.scheduledPayments
                            ?.find(
                              (p) => p.month === index + 1 && p.year === year
                            )
                            ?.amount?.toString() || ""
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onSubmit}
        className={styles.next}
        disabled={
          !paymentStore.paymentOverview.scheduledPayments ||
          paymentStore.paymentOverview.scheduledPayments.length === 0
        }
      >
        Next
      </button>
    </section>
  );
};

export default PaymentSchedule;
