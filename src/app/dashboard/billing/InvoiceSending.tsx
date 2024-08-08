import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./InvoiceSending.module.scss";
import InvoiceTotalStatement from "./InvoiceTotalStatement";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { generateInvoiceTotalStatementPdf } from "./InvoiceTotalStatement";
import { generateStatementPdf, getNextPayment } from "./Statement";
import Statement from "./Statement";
import { toast } from "react-toastify";

interface InvoiceSendingProps {
  paymentOverviews: Partial<PaymentOverviewModel>[] | null;
  invoiceType: string;
  onSendInvoices: () => void;
}

const nextYear = new Date().getFullYear() + 1;

export default function InvoiceSending({
  paymentOverviews,
  invoiceType,
  onSendInvoices,
}: InvoiceSendingProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const router = useRouter();

  const handleSendInvoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const paymentId = event.target.value;

    if (event.target.checked) {
      if (checkedIds.includes(paymentId)) return;
      setCheckedIds((prev) => [...prev, paymentId]);
    } else {
      setCheckedIds((prev) => prev.filter((id) => id !== paymentId));
    }
  };

  const sendInvoices = async () => {
    if (checkedIds.length === 0) {
      toast.error("No payments selected");
      return;
    }
    for (const id of checkedIds) {
      const paymentOverview = paymentOverviews?.find((po) => po.id === id);
      if (paymentOverview) {
        const customerEmail =
          paymentOverview.contact?.contactTelecomInformation?.email || null;
        if (!customerEmail) return;
        await generateAndSendPdf(paymentOverview, customerEmail);
      }
    }
    toast.success("Invoices sent");
    onSendInvoices();
  };

  const generateAndSendPdf = async (
    paymentOverview: Partial<PaymentOverviewModel>,
    customerEmail: string | null
  ) => {
    try {
      let pdfBlob: Blob = new Blob();
      if (invoiceType === "statement") {
        pdfBlob = await generateStatementPdf(paymentOverview);
      } else {
        pdfBlob = await generateInvoiceTotalStatementPdf(paymentOverview);
      }

      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onloadend = async function () {
        const base64data = reader.result;

        const nextPayment = getNextPayment(paymentOverview, true);
        await fetch("/api/sendEmail", {
          method: "POST",
          body: JSON.stringify({
            attachment: {
              ContentType: "application/pdf",
              Filename: `Invoice-${paymentOverview.year}.pdf`,
              Base64Content: base64data?.toString().split("base64,")[1], // Remove the prefix to get pure Base64 data
            },
            to: customerEmail,
            subject: `Invoice for Calendar ${paymentOverview.year}`,
            text: `Next Payment: ${nextPayment.dueDate} ${nextPayment.amount}`,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      };
    } catch (error) {
      toast.error("Error sending invoices");
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p>Company</p>
        <p>Contact</p>
        <p>Year</p>
        <p>Proof</p>
        <p>Send</p>
      </div>
      {paymentOverviews?.map((paymentOverview) => (
        <div className={styles.contactWrapper} key={paymentOverview.id}>
          <p className={styles.company}>
            {paymentOverview.contact?.contactContactInformation?.company}
          </p>
          <p className={styles.contactName}>
            {paymentOverview.contact?.contactContactInformation?.firstName}{" "}
            {paymentOverview.contact?.contactContactInformation?.lastName}
          </p>
          <p>{paymentOverview.year}</p>

          {invoiceType === "invoiceTotalSale" && (
            <InvoiceTotalStatement
              key={paymentOverview.id}
              paymentOverview={paymentOverview}
            />
          )}

          {invoiceType === "statements" && (
            <Statement
              key={paymentOverview.id}
              paymentOverview={paymentOverview}
            />
          )}
          <div>
            <input
              type="checkbox"
              name="sendInvoice"
              id="sendInvoice"
              onChange={handleSendInvoice}
              checked={checkedIds.includes(paymentOverview.id || "")}
              value={paymentOverview.id}
            />
          </div>
        </div>
      ))}
      <div>
        <button className={styles.sendButton} onClick={sendInvoices}>
          Send
        </button>
      </div>
    </div>
  );
}
