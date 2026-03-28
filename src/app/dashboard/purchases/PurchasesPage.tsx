"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePurchases } from "@/hooks/purchases/usePurchases";
import { PurchasesTable } from "./PurchasesTable";
import PurchaseDetailsModal from "./PurchaseDetailsModal";
import { ALL_YEARS } from "@/lib/constants";

const nextYear = new Date().getFullYear() + 1;
const defaultYear =
  ALL_YEARS.find((year) => year.value === String(nextYear))?.value ||
  ALL_YEARS[0].value;

const PurchasesPage = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseId, setPurchaseId] = useState("");
  const searchParams = useSearchParams();

  const initialYear = searchParams.get("year") || defaultYear;

  const {
    purchases,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    setSearch,
    year,
    setYear,
    artworkFilter,
    setArtworkFilter,
    pendingArtworkIds,
    handleDelete,
    handleDeleteSelected,
    handleToggleArtwork,
  } = usePurchases({
    initialYear,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const handleYearChange = (value: string) => {
    setYear(value);
  };

  const onPurchaseClick = (purchaseId: string, companyName: string) => {
    setPurchaseId(purchaseId);
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
          totalItems={totalItems}
          year={year}
          onYearChange={handleYearChange}
          filterOptions={ALL_YEARS}
          onPurchaseClick={onPurchaseClick}
          onToggleArtwork={handleToggleArtwork}
          pendingArtworkIds={pendingArtworkIds}
          artworkFilter={artworkFilter}
          onArtworkFilterChange={setArtworkFilter}
        />
      </section>
    </>
  );
};

export default PurchasesPage;
