"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePurchases } from "@/hooks/purchases/usePurchases";
import { PurchasesTable } from "./PurchasesTable";
import PurchaseDetailsModal from "./PurchaseDetailsModal";
import { ALL_YEARS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getPurchaseContactExportData } from "@/lib/data/purchase";
import { createContactsCsv, downloadCsv } from "@/lib/helpers/contactCsv";

const nextYear = new Date().getFullYear() + 1;
const defaultYear =
  ALL_YEARS.find((year) => year.value === String(nextYear))?.value ||
  ALL_YEARS[0].value;

const PurchasesPage = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseId, setPurchaseId] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const searchParams = useSearchParams();

  const initialYear = searchParams.get("year") || defaultYear;

  const {
    purchases,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    search,
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

  const handleDownloadContacts = async () => {
    setIsDownloading(true);
    try {
      const contacts = await getPurchaseContactExportData(year, search, artworkFilter);
      downloadCsv(createContactsCsv(contacts), `purchase-contacts-${year}.csv`);
    } finally {
      setIsDownloading(false);
    }
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
          actionContent={
            <Button
              className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500"
              onClick={handleDownloadContacts}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Contacts
            </Button>
          }
        />
      </section>
    </>
  );
};

export default PurchasesPage;
