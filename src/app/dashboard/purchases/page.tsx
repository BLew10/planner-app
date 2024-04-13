"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import { MdCheck, MdOutlineCancel } from "react-icons/md";
import Table from "@/app/(components)/general/Table";
import { getAllPurchases, PurchaseTableData } from "@/lib/data/purchase";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import deletePurchase from "@/actions/purchases/deletePurchase";
import SimpleModal from "@/app/(components)/general/SimpleModal";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { toast, ToastContainer } from 'react-toastify';
const columns = [
  {
    name: "Company Name",
    size: "default",
  },
  {
    name: "Amount Owed",
    size: "default",
  },
  {
    name: "Calendar Edition",
    size: "default",
  },
  {
    name: "Year",
    size: "default",
  },
  {
    name: "Payment Scheduled",
    size: "default",
  },
  {
    name: "Actions",
    size: "default",
  },
];
const PurchasesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [purchases, setPurchases] = useState<PurchaseTableData[] | null>([]);
  const successNotify = () => toast.success("Successfully Deleted");
  const errorNotify = () => toast.error("Something went wrong. Deletion failed");
  useEffect(() => {
    const fetchPurchases = async () => {
      const purhcases = await getAllPurchases();
      setPurchases(purhcases);
    };
    fetchPurchases();
  }, []);

  

  const onDeletePurchase = async (purchaseId: string) => {
    const deleted = await deletePurchase(purchaseId);
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
      p.companyName,
      `$${p.amountOwed?.toFixed(2)}`,
      p.calendarEdition,
      p.year,
      <div className={styles.paymentWrapper} key={p.id}>
        {p.paymentScheduled ? (
          <MdCheck className={styles.paymentScheduled} />
        ) : (
          <MdOutlineCancel className={styles.paymentPending} />
        )}
      </div>,
      <div className={styles.modWrapper} key={p.id}>
        {!p.paymentScheduled && (
          <Link
            href={`/dashboard/payments/add?contactId=${p.contactId}`}
            className={styles.paymentAction}
          >
            Add Payment
          </Link>
        )}
        <Link
          href={`/dashboard/purchases/${p.id}?contactId=${p.contactId}`}
          className={styles.editAction}
        >
          Edit
        </Link>
          <DeleteButton
            title="Delete Purchase"
            text={`Are you sure you want to delete ${p.companyName}'s purchase for ${p.year} ${p.calendarEdition}?`}
            onDelete={() => {
              if (p.paymentScheduled) {
                setShowModal(true);
                return;
              }
              onDeletePurchase(p.id);
            }}
          />
      </div>,
    ];
  });

  return (
    <>
      <SimpleModal
        isOpen={showModal}
        closeModal={() => setShowModal(false)}
        text="Purchase cannot be deleted. This purchase has payments scheduled."
      />
      <AnimateWrapper>
        <section className={styles.container}>
        <ToastContainer />
          <Table
            tableName="Purchases"
            columns={columns}
            data={data}
            addPath={"/dashboard/contacts"}
          />
        </section>
      </AnimateWrapper>
    </>
  );
};

export default PurchasesPage;
