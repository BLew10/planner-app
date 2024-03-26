"use client";

import React, { useState, useEffect } from "react";

import { PaymentTableData } from "@/lib/data/payment";
import { PaymentStatusType, PAYMENT_STATUSES } from "@/lib/constants";
import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getAllPayments } from "@/lib/data/payment";
import deletePayment from "@/actions/payments/deletePayment";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";

const PaymentsPage = () => {
  const [payments, setPayments] = useState<
    Partial<PaymentTableData>[] | null
  >();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>(
    PAYMENT_STATUSES[0].value as PaymentStatusType
  );

  const fetchPayments = async (paymentStatus: PaymentStatusType) => {
    const payments = await getAllPayments(paymentStatus);
    setPayments(payments);
  };

  useEffect(() => {
    fetchPayments(paymentStatus);
  }, [paymentStatus]);

  const handlePaymentStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPaymentStatus(e.target.value as PaymentStatusType);
  };

  const columns = [
    {
      name: "Contact",
      size: "default",
    },
    {
      name: "Total",
      size: "default",
    },
    {
      name: "Amount Paid",
      size: "default",
    },
    {
      name: "Status",
      size: "default",
    },
    {
      name: "Payment Start Date",
      size: "default",
    },
    {
      name: "Payment End Date",
      size: "default",
    },
    {
      name: "Next Payment Due Date",
      size: "default",
    },
    {
      name: "Actions",
      size: "default",
    },
  ];

  function getNextPaymentDate(
    startDate: Date,
    endDate: Date,
    frequency: string
  ) {
    const today = new Date();
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    if (today > endDate) return null; // No next payment after the end date
    if (today <= startDate) return startDate.toISOString().split("T")[0]; // If today is before the start date, the next payment is the start date

    let nextPaymentDate = new Date(startDate);

    while (nextPaymentDate < today) {
      switch (frequency) {
        case "Weekly":
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
          break;
        case "Bi-Weekly":
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 14);
          break;
        case "Monthly":
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
          break;
        case "Quarterly":
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 3);
          break;
        case "Bi-Annual":
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 6);
          break;
        default:
          throw new Error(`Unhandled frequency: ${frequency}`);
      }
    }

    // If the calculated next payment date is after the end date, return null since payments should have concluded. TODO: Add a successful payment message
    if (nextPaymentDate > endDate) {
      return null;
    }

    return nextPaymentDate.toISOString().split("T")[0];
  }

  const data = payments?.map((p) => {
    return [
      p.companyName,
      `$${Number(p.totalOwed).toFixed(2)}`,
      `$${Number(p.totalPaid).toFixed(2)}`,
      p.status,
      p.startDate?.toISOString().split("T")[0],
      p.anticipatedEndDate?.toISOString().split("T")[0],
      getNextPaymentDate(
        p.startDate || new Date(),
        p.anticipatedEndDate || new Date(),
        p.frequency || ""
      ),
      <div className={styles.modWrapper}>
        {p.status === "Pending" && (
          <Link
            href={`/dashboard/payments/${p.id}`}
            className={styles.editAction}
          >
            Edit
          </Link>
        )}
        <form action={deletePayment}>
          <button type="submit" className={styles.deleteAction}>
            Delete
          </button>
          <input type="hidden" name="paymentId" value={p.id} />
        </form>
      </div>,
    ];
  });

  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <Table
          tableName="Payments"
          columns={columns}
          data={data}
          filterOptions={PAYMENT_STATUSES}
          handleFilterChange={handlePaymentStatusChange}
        />
      </section>
    </AnimateWrapper>
  );
};

export default PaymentsPage;
