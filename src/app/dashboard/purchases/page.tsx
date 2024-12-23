"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import { MdCheck, MdOutlineCancel } from "react-icons/md";
import Table from "@/app/(components)/general/Table";
import { getPurchaseTableData, PurchaseTableData } from "@/lib/data/purchase";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { CalendarEdition } from "@prisma/client";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import deletePurchase from "@/actions/purchases/deletePurchase";
import SimpleModal from "@/app/(components)/general/SimpleModal";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { ALL_YEARS } from "@/lib/constants";
import { toast, ToastContainer } from "react-toastify";
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

const currentYear = new Date().getFullYear();
const defaultYear =
  ALL_YEARS.find((year) => year.value === String(currentYear))?.value ||
  ALL_YEARS[0].value;
const PurchasesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [purchases, setPurchases] = useState<PurchaseTableData[] | null>([]);
  const [calendarId, setCalendarId] = useState("");
  const [calendars, setCalendars] = useState<Partial<CalendarEdition>[] | null>(
    []
  );
  const [year, setYear] = useState(defaultYear);
  const successNotify = () => toast.success("Successfully Deleted");
  const errorNotify = () =>
    toast.error("Something went wrong. Deletion failed");

  useEffect(() => {
    const fetchCalendars = async () => {
      const calendars = await getAllCalendars();
      setCalendars(calendars);
      if (calendars && calendars.length > 0) {
        setCalendarId(calendars[0].id || "");
      }
    };
    fetchCalendars();
  }, []);

  useEffect(() => {
    const fetchPurchases = async () => {
      const purhcases = await getPurchaseTableData(calendarId, year);
      setPurchases(purhcases);
    };
    fetchPurchases();
  }, [calendarId, year]);

  const handleCalendarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCalendarId(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
  };

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
            filterOptions={
              calendars?.map((calendar) => ({
                label: calendar.name || "",
                value: calendar.id || "",
              })) || []
            }
            handleFilterChange={handleCalendarChange}
            filterOptionsTwo={ALL_YEARS}
            handleFilterChangeTwo={handleYearChange}
          />
        </section>
      </AnimateWrapper>
    </>
  );
};

export default PurchasesPage;
