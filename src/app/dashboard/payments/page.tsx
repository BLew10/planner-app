"use client";

import React, { useState, useEffect } from "react";

import { PaymentTableData } from "@/lib/data/payment";
import { PaymentStatusType, PAYMENT_STATUSES } from "@/lib/constants";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getAllPayments } from "@/lib/data/payment";
import deletePayment from "@/actions/payments/deletePayment";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import InvoicesModal from "./InvoicesModal";
import { toast, ToastContainer } from 'react-toastify';

const defaultColumns = [
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
    name: "Action",
    size: "default",
  },
];
const PaymentsPage = () => {
  const [payments, setPayments] = useState<
    Partial<PaymentTableData>[] | null
  >();
  const [formattedTableData, setFormattedTableData] = useState<any>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>(
    PAYMENT_STATUSES[0].value as PaymentStatusType
  );
  const [columnsToDisplay, setColumnsToDisplay] =
    useState<any[]>(defaultColumns);
  const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const successNotify = () => toast.success("Successfully Deleted");
  const errorNotify = () => toast.error("Something went wrong. Deletion failed");

  const onCancelPayment = async (paymentId?: string, scheduleId?: string) => {
    const deleted = await deletePayment(paymentId || "-1", scheduleId || "-1");
    const newPayments = payments?.filter((p) => p.id !== paymentId);
    setPayments(newPayments || []);
    if (deleted) {
      successNotify();
    } else {
      errorNotify();
    }
  };

  useEffect(() => {
    const mappedPayments = payments?.map((p) => {
      let rowData: any[] = [
        p.companyName,
        `$${Number(p.totalOwed).toFixed(2)}`,
        `$${Number(p.totalPaid).toFixed(2)}`,
        p.status,
        p.startDate,
        p.anticipatedEndDate,
        getNextPaymentDate(
          p.startDate || new Date(),
          p.anticipatedEndDate || new Date(),
          p.frequency || ""
        ),
      ];

      const actionsData = (
        <div key={p.id} className={styles.modWrapper}>
          <div
            className={styles.invoicesButton}
            onClick={() => handleViewInvoices(p.id as string)}
          >
            View Invoices
          </div>
          {paymentStatus === "Pending" && typeof p.id == "string" && (
            <div className={styles.modWrapper} >
              <DeleteButton
                onDelete={() => onCancelPayment(p.id, p.stripeScheduleId)}
                deleteText="Cancel"
                text={`Are you sure you want to cancel the pending payment for ${
                  p.companyName
                } from ${p.startDate} to ${
                  p.anticipatedEndDate
                }`}
                title="Cancel Payment"
              />
            </div>
          )}
        </div>
      );
      rowData.push(actionsData);

      return rowData;
    });
    setFormattedTableData(mappedPayments || []);
  }, [payments]);

  const handleViewInvoices = (paymentId: string) => {
    setOpenInvoiceModal(true);
    setPaymentId(paymentId);
  };

  useEffect(() => {
    const paymentStatusChanged = async () => {
      const payments = await getAllPayments(paymentStatus);
      setPayments(payments);
    };
    paymentStatusChanged();
  }, [paymentStatus]);

  const handlePaymentStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPaymentStatus(e.target.value as PaymentStatusType);
  };

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
        case "Daily":
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 1);
          break;
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

  return (
    <>
      <InvoicesModal
        isOpen={openInvoiceModal}
        closeModal={() => setOpenInvoiceModal(false)}
        paymentId={paymentId}
      />
      <AnimateWrapper>
        <section className={styles.container}>
        <ToastContainer />
          <Table
            tableName="Payments"
            columns={columnsToDisplay}
            data={formattedTableData}
            filterOptions={PAYMENT_STATUSES}
            handleFilterChange={handlePaymentStatusChange}
          />
        </section>
      </AnimateWrapper>
    </>
  );
};

export default PaymentsPage;
