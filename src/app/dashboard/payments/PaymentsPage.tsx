"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getPaymentsByCalendarEditionYear } from "@/lib/data/payment";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import deletePayment from "@/actions/payment/deletePayment";
import PaymentScheduleModal from "../billing/PaymentScheduleModal";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { PaymentModel } from "@/lib/models/payment";
import { ALL_YEARS } from "@/lib/constants";
import { useToast } from "@/hooks/shadcn/use-toast";

const columns = [
  {
    name: "Company Name",
    size: "default",
  },
  {
    name: "Amount",
    size: "default",
  },
  {
    name: "Payment Date",
    size: "default",
  },
  {
    name: "Payment Method",
    size: "default",
  },
  {
    name: "Check Number",
    size: "default",
  },
  {
    name: "Actions",
    size: "default",
  },
];

const nextYear = String(new Date().getFullYear() + 1);
const PaymentsPage = () => {
  const [showPaymentScheduleModal, setShowPaymentScheduleModal] =
    useState(false);
  const [payments, setPayments] = useState<Partial<PaymentModel>[] | null>([]);
  const [paymentOverview, setPaymentOverview] = useState({
    id: "",
    companyName: "",
  });
  const [year, setYear] = useState(nextYear);
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const successNotify = () => toast({
    title: "Successfully Deleted",
    variant: "default",
  });
  const errorNotify = () => toast({
    title: "Something went wrong. Deletion failed",
    variant: "destructive",
  });

  useEffect(() => {
    const yearParam = searchParams.get("year");
    if (yearParam) {
      setYear(yearParam);
    }
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      const payments = await getPaymentsByCalendarEditionYear(year);
      setPayments(payments);
    };
    fetchPayments();
  }, [year]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
  };

  const onPaymentClick = (paymentOverviewId: string, companyName: string) => {
    setPaymentOverview({
      id: paymentOverviewId,
      companyName: companyName,
    });
    setShowPaymentScheduleModal(true);
  };

  const onDeletePayment = async (paymentId: string) => {
    const deleted = await deletePayment(paymentId);
    const newPayments = payments?.filter((p) => p.id !== paymentId);
    setPayments(newPayments || null);
    if (deleted) {
      successNotify();
    } else {
      errorNotify();
    }
  };

  const data = payments?.map((p) => {
    return [
      <button
        className={styles.companyName}
        key={p.id}
        onClick={() =>
          onPaymentClick(
            p.paymentOverviewId || "",
            p.contact?.contactContactInformation?.company || ""
          )
        }
        dataset-search={`${p.contact?.contactContactInformation?.company}`}
      >
        {p.contact?.contactContactInformation?.company}
      </button>,
      `$${Number(p.amount).toFixed(2)}`,
      p.paymentDate,
      p.paymentMethod,
      p.checkNumber,
      <div className={styles.modWrapper} key={p.id}>
        {!p.wasPrepaid ? (
          <>
            <Link
              href={`/dashboard/payments/${p.id}?purchaseId=${p.purchaseId}&paymentOverviewId=${p.paymentOverviewId}`}
              className={styles.paymentAction}
            >
              Edit
            </Link>
            <DeleteButton
              itemType="payment"
              itemName={p.contact?.contactContactInformation?.company || ""}
              onDelete={() => {
                onDeletePayment(p.id || "");
              }}
            />
          </>
        ) : (
          <p className={styles.prepayment}>PREPAYMENT - CAN&apos;T EDIT HERE</p>
        )}
      </div>,
    ];
  });

  return (
      <>
        <PaymentScheduleModal
          isOpen={showPaymentScheduleModal}
          closeModal={() => setShowPaymentScheduleModal(false)}
          title={`Payment Details for ${paymentOverview.companyName} in ${year}`}
          paymentId={paymentOverview.id}
        />

        <AnimateWrapper>
          <section className={styles.container}>
            <Table
              tableName="Payments"
              columns={columns}
              data={data}
              addPath={"/dashboard/purchases"}
              filterOptions={ALL_YEARS}
              filterValue={year}
              handleFilterChange={handleYearChange}
            />
          </section>
        </AnimateWrapper>
      </>
  );
};

export default PaymentsPage;
