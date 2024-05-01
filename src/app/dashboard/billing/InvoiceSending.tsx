import React, { useState } from "react";
import styles from "./InvoiceSending.module.scss";
import InvoiceTotalStatement from "./InvoiceTotalStatement";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import Statement from "./Statement";

interface InvoiceSendingProps {
  paymentOverviews: Partial<PaymentOverviewModel>[] | null;
  invoiceType: string;
}

export default function InvoiceSending({
  paymentOverviews,
  invoiceType,
}: InvoiceSendingProps) {
  const [invoicesToSend, setInvoicesToSend] = useState<
    Partial<PaymentOverviewModel>[]
  >([]);
  const handleSendInvoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const paymentId = event.target.value;
    if (event.target.checked) {
      setInvoicesToSend([
        ...(invoicesToSend || []),
        paymentOverviews?.find((payment) => payment.id === paymentId)!,
      ]);
    } else {
      setInvoicesToSend(
        invoicesToSend.filter((payment) => payment.id !== paymentId)
      );
    }
  };

  const sendInvoices = async () => {
    //TODO send invoices
  }
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

          {invoiceType === "invoiceTotalSale" &&(
             <InvoiceTotalStatement
             key={paymentOverview.id}
             paymentOverview={paymentOverview}
           />
          )}

          {invoiceType === "statements" && (
            <Statement key={paymentOverview.id} paymentOverview={paymentOverview} />
          )}
          <div>
            <input
              type="checkbox"
              name="sendInvoice"
              id="sendInvoice"
              onChange={handleSendInvoice}
            />
          </div>
        </div>
      ))}
      <div>
        <button
          className={styles.sendButton}
          onClick={sendInvoices}
        >
          Send
        </button>
      </div>
    </div>
  );
}
