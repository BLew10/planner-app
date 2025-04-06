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

const ITEMS_PER_PAGE = 10;

const PaymentsPage = () => {
  const [showPaymentScheduleModal, setShowPaymentScheduleModal] = useState(false);
  const [paymentOverview, setPaymentOverview] = useState({ id: "", companyName: "" });
  const searchParams = useSearchParams();

  // Initialize the year from URL or default
  const initialYear = searchParams.get("year") || defaultYear;

  const {
    payments,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    page,
    setPage,
    search,
    setSearch,
    year,
    setYear,
    handleDelete,
    handleDeleteSelected,
  } = usePayments({
    itemsPerPage: ITEMS_PER_PAGE,
    initialYear,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1); // Reset to first page when search changes
  };

  const handleYearChange = (value: string) => {
    setYear(value);
    setPage(1); // Reset to first page when filter changes
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
          onPageChange={setPage}
          totalItems={totalItems}
          currentPage={page}
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
