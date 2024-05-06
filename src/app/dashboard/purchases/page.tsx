"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getPurchaseTableData, PurchaseTableData } from "@/lib/data/purchase";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import deletePurchase from "@/actions/purchases/deletePurchase";
import PurchaseDetailsModal from "./PurchaseDetailsModal";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { ALL_YEARS } from "@/lib/constants";
import { toast, ToastContainer } from "react-toastify";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
const columns = [
  {
    name: "Company Name",
    size: "default",
  },
  {
    name: "Purchase Total",
    size: "default",
  },
  {
    name: "Total with Discounts and Late Fees",
    size: "default",
  },
  {
    name: "Purchased On",
    size: "default",
  },
  {
    name: "Amount Paid",
    size: "default",
  },
  {
    name: "Calendar Editions",
    size: "default",
  },
  {
    name: "Actions",
    size: "default",
  },
];

const currentYear = new Date().getFullYear();
const defaultYear =
  ALL_YEARS.find((year) => year.value === String(currentYear))?.value ||
  ALL_YEARS[0].value;
const PurchasesPage = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchases, setPurchases] = useState<PurchaseTableData[] | null>([]);
  const [purchaseId, setPurchaseId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [year, setYear] = useState(defaultYear);
  const searchParams = useSearchParams();
  const successNotify = () => toast.success("Successfully Deleted");
  const errorNotify = () =>
    toast.error("Something went wrong. Deletion failed");

  useEffect(() => {
    const yearParam = searchParams.get("year");
    if (yearParam) {
      setYear(yearParam);
    }
  }, []);

  useEffect(() => {
    const fetchPurchases = async () => {
      const purhcases = await getPurchaseTableData(year);
      setPurchases(purhcases);
    };
    fetchPurchases();
  }, [year]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
  };

  const onPurchaseClick = (purchaseId: string, companyName: string) => {
    setPurchaseId(purchaseId);
    setCompanyName(companyName);
    setShowPurchaseModal(true);
  };

  const onDeletePurchase = async (
    purchaseId: string,
    paymentOverviewId: string
  ) => {
    const deleted = await deletePurchase(purchaseId, paymentOverviewId);
    const newPurchases = purchases?.filter((p) => p.id !== purchaseId);
    setPurchases(newPurchases || null);
    if (deleted) {
      successNotify();
    } else {
      errorNotify();
    }
  };
  const data = purchases?.map((p) => {
    return [
      <button
        className={styles.companyName}
        key={p.id}
        onClick={() => onPurchaseClick(p.id, p.companyName)}
        dataset-search={`${p.companyName}`}
      >
        {p.companyName}
      </button>,
      `$${p.amountOwed?.toFixed(2)}`,
      `$${p.total?.toFixed(2)}`,
      p.purchasedOn,
      `$${p.amountPaid?.toFixed(2)}`,
      p.calendarEditions,
      <div className={styles.modWrapper} key={p.id}>
        {!p.paymentOverviewId ? (
          <Link
            href={`/dashboard/payment-overview/add?purchaseId=${p.id}`}
            className={styles.paymentAction}
          >
            Add Payment Plan
          </Link>
        ) : (
          <>
            <Link
              href={`/dashboard/payments/add?purchaseId=${p.id}&paymentOverviewId=${p.paymentOverviewId}`}
              className={styles.makePaymentAction}
            >
              Make Payment
            </Link>
          </>
        )}
        <Link
          href={`/dashboard/purchases/${p.id}?contactId=${p.contactId}&year=${p.year}`}
          className={styles.editAction}
        >
          Edit Purchase
        </Link>
        <DeleteButton
          title="Delete Purchase"
          text={`Are you sure you want to delete ${p.companyName}'s purchase for ${p.year}`}
          onDelete={() => {
            onDeletePurchase(p.id, p.paymentOverviewId || "");
          }}
        />
      </div>,
    ];
  });

  return (
    <>
      <PurchaseDetailsModal
        title={`${companyName} - ${year}`}
        isOpen={showPurchaseModal}
        closeModal={() => setShowPurchaseModal(false)}
        purchaseId={purchaseId}
      />

      <AnimateWrapper>
        <section className={styles.container}>
          <ToastContainer />
          <Table
            tableName="Purchases"
            columns={columns}
            data={data}
            addPath={"/dashboard/contacts"}
            filterOptions={ALL_YEARS}
            filterValue={year}
            handleFilterChange={handleYearChange}
          />
        </section>
      </AnimateWrapper>
    </>
  );
};

export default PurchasesPage;
