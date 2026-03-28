"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePayments } from "@/hooks/payments/usePayments";
import { PaymentsTable } from "./PaymentsTable";
import PaymentScheduleModal from "../billing/PaymentScheduleModal";
import { ALL_YEARS } from "@/lib/constants";

const nextYear = new Date().getFullYear() + 1;
const defaultYear =
  ALL_YEARS.find((year) => year.value === String(nextYear))?.value ||
  ALL_YEARS[0].value;

const PaymentsPage = () => {
  const [showPaymentScheduleModal, setShowPaymentScheduleModal] =
    useState(false);
  const [paymentOverview, setPaymentOverview] = useState({
    id: "",
    companyName: "",
  });
  const searchParams = useSearchParams();

  const initialYear = searchParams.get("year") || defaultYear;

  const {
    payments,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    setSearch,
    year,
    setYear,
    handleDelete,
    handleDeleteSelected,
  } = usePayments({
    initialYear,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const handleYearChange = (value: string) => {
    setYear(value);
  };

  const onPaymentClick = (paymentOverviewId: string, companyName: string) => {
    setPaymentOverview({
      id: paymentOverviewId,
      companyName,
    });
    setShowPaymentScheduleModal(true);
  };

  return (
    <>
      {paymentOverview.id && (
        <PaymentScheduleModal
          isOpen={showPaymentScheduleModal}
          closeModal={() => setShowPaymentScheduleModal(false)}
          title={`Payment Details for ${paymentOverview.companyName} in ${year}`}
          paymentId={paymentOverview.id}
        />
      )}

      <section className="container mx-auto px-4 w-full mt-10">
        <PaymentsTable
          payments={payments}
          isLoading={isLoading}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          onDelete={handleDelete}
          onDeleteSelected={handleDeleteSelected}
          onSearch={handleSearch}
          totalItems={totalItems}
          year={year}
          onYearChange={handleYearChange}
          filterOptions={ALL_YEARS}
          onPaymentClick={onPaymentClick}
        />
      </section>
    </>
  );
};

export default PaymentsPage;
