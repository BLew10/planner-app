import { useEffect, useState } from "react";
import styles from "./ContactPaymentsOverview.module.scss";
import { getPaymentsByContactId } from "@/lib/data/payment";
import Table from "@/app/(components)/general/Table";
import { PaymentTableData } from "@/lib/data/payment";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
interface ContactPaymentsOverviewProps {
  contactId: string;
}
const defaultColumns = [
  {
    name: "Total",
    size: "default",
  },
  {
    name: "Amount Paid",
    size: "default",
  },
  {
    name: "Status",
    size: "default",
  },
  {
    name: "Payment Start Date",
    size: "default",
  },
  {
    name: "Payment End Date",
    size: "default",
  },
  {
    name: "Associated Purchases",
    size: "default",
    wrap: true,
  },
];

const ContactPaymentsOverview = ({
  contactId,
}: ContactPaymentsOverviewProps) => {
  const [payments, setPayments] = useState<
    Partial<PaymentTableData>[] | null
  >();
  const [formattedTableData, setFormattedTableData] = useState<any>([]);
  const [columnsToDisplay, setColumnsToDisplay] =
    useState<any[]>(defaultColumns);


  useEffect(() => {
    const mappedPayments = payments?.map((p) => {
      // Start with the common data for all rows
      const purchases = p.purchases?.map((p) => p.calendarEdition ? `${p.calendarEdition.name} ${p.year}` : "Custom Payment").join(", ");
      let rowData: any[] = [
        `$${Number(p.totalOwed).toFixed(2)}`,
        `$${Number(p.totalPaid).toFixed(2)}`,
        p.status,
        p.startDate?.toISOString().split("T")[0],
        p.anticipatedEndDate?.toISOString().split("T")[0],
        purchases
      ];

      return rowData;
    });
    setFormattedTableData(mappedPayments || []);
  }, [payments]);

  useEffect(() => {
    const fetchContactPayments = async (cID: string) => {
      const payments = await getPaymentsByContactId(cID);
      setPayments(payments);
    };
    fetchContactPayments(contactId);
  }, []);


  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <Table
          tableName="Payments"
          columns={columnsToDisplay}
          data={formattedTableData}
        />
      </section>
    </AnimateWrapper>
  );
};
export default ContactPaymentsOverview;
