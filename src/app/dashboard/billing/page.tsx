"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.scss";
import { getOwedPayments } from "@/lib/data/paymentOverview";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import InvoiceSending from "./InvoiceSending";
import Table from "@/app/(components)/general/Table";
import CheckboxInput from "@/app/(components)/form/CheckboxInput";
import { ALL_YEARS, INVOICE_TYPES, InvoiceType } from "@/lib/constants";
import { ScheduledPayment } from "@prisma/client";
import SimpleModal from "@/app/(components)/general/SimpleModal";
import SelectInput from "@/app/(components)/form/SelectInput";
import PaymentScheduleModal from "./PaymentScheduleModal";
import { ToastContainer } from "react-toastify";
import { DEFAULT_YEAR } from "@/lib/constants";

const columns = [
  {
    name: "Contact",
    size: "default",
  },
  {
    name: "Email",
    size: "default",
    wrap: true,
  },
  {
    name: "Next Payment Due On",
    size: "default",
  },
  {
    name: "Purchased On",
    size: "medium",
  },
  {
    name: "Balance",
    size: "medium",
  },
  {
    name: "Invoice Number",
    size: "medium",
  },
];

const getNextPaymentDate = (scheduledPayments: ScheduledPayment[] | null) => {
  if (scheduledPayments) {
    for (const scheduledPayment of scheduledPayments || []) {
      if (!scheduledPayment.isPaid)
        return {
          dueDate: scheduledPayment.dueDate,
          isLate: scheduledPayment.isLate,
        };
    }
  }
  return { dueDate: "", isLate: false };
};

const BillingPage = () => {
  const [owedPayments, setOwedPayments] = useState<
    Partial<PaymentOverviewModel>[] | null
  >(null);
  const [payment, setPayment] = useState<Partial<PaymentOverviewModel> | null>(
    null
  );
  const [step, setStep] = useState(1);
  const [selectedPayments, setSelectedPayments] = useState<
    Partial<PaymentOverviewModel>[]
  >([]);
  const [invoiceType, setInvoiceType] =
    useState<InvoiceType>("invoiceTotalSale");
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [selectAll, setSelectAll] = useState(false);
  const [tableData, setTableData] = useState<any[]>();
  const [openModal, setOpenModal] = useState(false);
  const [openPaymentScheduleModal, setOpenPaymentScheduleModal] =
    useState(false);
  const onPaymentClick = (paymentId: string) => {
    setPayment(owedPayments?.find((p) => p.id === paymentId) || null);
    setOpenPaymentScheduleModal(true);
  };

  useEffect(() => {
    const fetchPayments = async (year: string) => {
      const payments = await getOwedPayments(year);
      setOwedPayments(payments);
      setSelectedPayments([]);
      setSelectAll(false);
    };
    fetchPayments(year);
  }, [year]);

  const handleSelectedPayment = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const paymentId = event.target.value;
    if (event.target.checked) {
      if (selectedPayments?.find((payment) => payment.id === paymentId)) return;
      setSelectedPayments([
        ...(selectedPayments || []),
        owedPayments?.find((payment) => payment.id === paymentId)!,
      ]);
    } else {
      setSelectedPayments(
        selectedPayments.filter((payment) => payment.id !== paymentId)
      );
    }
  };

  useEffect(() => {
    const newTableData = owedPayments?.map((p) => {
      const balance = Number(p.net || 0) - Number(p.amountPaid || 0);
      const nextPaymentDate = getNextPaymentDate(
        p.scheduledPayments as ScheduledPayment[]
      );
      return [
        <div
          key={p.id}
          dataset-search={`${p.contact?.contactContactInformation?.firstName} ${p.contact?.contactContactInformation?.lastName} ${p.contact?.contactContactInformation?.company}`}
        >
          {p.contact?.contactTelecomInformation?.email ? (
            <CheckboxInput
              name="payments"
              value={p.id}
              checked={selectedPayments?.some((payment) => payment.id === p.id)}
              onChange={handleSelectedPayment}
              label={
                <p
                  className={styles.contactName}
                  onClick={() => onPaymentClick(p.id as string)}
                >
                  <span>
                    {p.contact?.contactContactInformation?.firstName}{" "}
                    {p.contact?.contactContactInformation?.lastName}
                  </span>
                  <span>{p.contact?.contactContactInformation?.company}</span>
                </p>
              }
            />
          ) : (
            <p
              className={styles.contactNameNoEmail}
              onClick={() => onPaymentClick(p.id as string)}
            >
              <span>
                {p.contact?.contactContactInformation?.firstName}{" "}
                {p.contact?.contactContactInformation?.lastName}
              </span>
              <span>{p.contact?.contactContactInformation?.company}</span>
            </p>
          )}
        </div>,
        <div
          key={p.id}
          dataset-search={`${p.contact?.contactContactInformation?.firstName} ${p.contact?.contactContactInformation?.lastName} ${p.contact?.contactContactInformation?.company}`}
        >
          {p.contact?.contactTelecomInformation?.email ? (
            <p className={styles.email}>
              {p.contact?.contactTelecomInformation?.email}
            </p>
          ) : (
            <p className={styles.noEmail}>
              No Email Provided, Please Add Email
            </p>
          )}
        </div>,
        <p
          key={p.id}
          className={nextPaymentDate.isLate ? styles.latePayment : ""}
          dataset-search={`${nextPaymentDate.dueDate} ${nextPaymentDate.isLate ? "- Late!" : ""}`}
        >
          {nextPaymentDate.dueDate} {nextPaymentDate.isLate ? "- Late!" : ""}
        </p>,
        formatDateToString(p.purchase?.createdAt as Date),
        `$${balance.toFixed(2)}`,
        p.invoiceNumber,
      ];
    });
    setTableData(newTableData);
  }, [owedPayments, selectedPayments]);

  const handleInvoiceType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const invoiceType = event.target.value;
    setInvoiceType(invoiceType as InvoiceType);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    setYear(year);
  };

  const onNext = () => {
    setStep((prev) => prev + 1);
  };

  const toggleAllCheckboxes = () => {
    const toggledSelectAll = !selectAll;
    if (toggledSelectAll) {
      const paymentsWithEmail = owedPayments?.filter(
        (payment) => payment.contact?.contactTelecomInformation?.email
      );
      setSelectedPayments(paymentsWithEmail || []);
    } else {
      setSelectedPayments([]);
    }
    setSelectAll(toggledSelectAll);
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <SimpleModal
        isOpen={openModal}
        closeModal={() => setOpenModal(false)}
        title="Invoice Type Selection"
        actionText="Generate Invoices"
        onAction={() => {
          onNext();
          setOpenModal(false);
        }}
        text={
          <SelectInput
            name="invoiceType"
            label="Invoice Type"
            id="invoiceType"
            onChange={handleInvoiceType}
            value={invoiceType}
            options={INVOICE_TYPES}
          />
        }
      />

      <PaymentScheduleModal
        isOpen={openPaymentScheduleModal}
        closeModal={() => setOpenPaymentScheduleModal(false)}
        title={`Payment Schedule for ${payment?.contact?.contactContactInformation?.firstName} ${payment?.contact?.contactContactInformation?.lastName}`}
        paymentId={payment?.id as string}
      />

      {step !== 1 && (
        <button
          className={styles.backButton}
          onClick={() => setStep((prev) => prev - 1)}
        >
          Back
        </button>
      )}
      {step === 1 && (
        <Table
          tableName="Upcoming Payments"
          columns={columns}
          data={tableData}
          filterOptions={ALL_YEARS}
          handleFilterChange={handleYearChange}
          filterValue={year}
          selectedCount={selectedPayments?.length || 0}
          toggleSelectAll={toggleAllCheckboxes}
          allSelected={selectAll}
          selectedAction={() => setOpenModal(true)}
          selectActionDescription="Generate Invoices"
        />
      )}
      {step === 2 && (
        <InvoiceSending
          paymentOverviews={selectedPayments}
          invoiceType={invoiceType}
          onSendInvoices={() => setStep((prev) => prev - 1)}
        />
      )}
    </div>
  );
};

export default BillingPage;
