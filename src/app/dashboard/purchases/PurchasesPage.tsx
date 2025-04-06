"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.scss";
import { PurchaseTableData } from "@/lib/data/purchase";
import { usePurchases } from "@/hooks/purchases/usePurchases";
import { PurchasesTable } from "./PurchasesTable";
import PurchaseDetailsModal from "./PurchaseDetailsModal";
import { ALL_YEARS } from "@/lib/constants";

const nextYear = new Date().getFullYear() + 1;
const defaultYear =
  ALL_YEARS.find((year) => year.value === String(nextYear))?.value ||
  ALL_YEARS[0].value;

const ITEMS_PER_PAGE = 10;

const PurchasesPage = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseId, setPurchaseId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const searchParams = useSearchParams();

  // Initialize the year from URL or default
  const initialYear = searchParams.get("year") || defaultYear;

  const {
    purchases,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    page,
    setPage,
    setSearch,
    year,
    setYear,
    handleDelete,
    handleDeleteSelected,
  } = usePurchases({
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

  const onPurchaseClick = (purchaseId: string, companyName: string) => {
    setPurchaseId(purchaseId);
    setCompanyName(companyName);
    setShowPurchaseModal(true);
  };

  return (
    <>
      {purchaseId && (
        <PurchaseDetailsModal
          isOpen={showPurchaseModal}
          closeModal={() => setShowPurchaseModal(false)}
          purchaseId={purchaseId}
        />
      )}

      <section className="container mx-auto px-4 w-full mt-10">
        <PurchasesTable
          purchases={purchases}
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
          onPurchaseClick={onPurchaseClick}
        />
      </section>
    </>
  );
};

export default PurchasesPage;
