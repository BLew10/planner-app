import { useEffect, useState } from "react";
import styles from "./ContactPaymentsOverview.module.scss";
import Table from "@/app/(components)/general/Table";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { getPaymentsByContactIdAndYear } from "@/lib/data/payment";
import { ALL_YEARS } from "@/lib/constants";
import { PaymentModel } from "@/lib/models/payment";
interface ContactPaymentsOverviewProps {
  contactId: string;
}
const defaultColumns = [
  {
    name: "Amount Paid",
    size: "default",
  },
  {
    name: "Payment Date",
    size: "default",
  },
    {
      name: "Payment Method",
      size: "default",
    },
    {
      name: "Check Number",
      size: "default",
    },
    {
      name: "Invoice Number",
      size: "default",
    },
  {
    name: "Calendar Editions",
    size: "default",
  },
];

const ContactPaymentsOverview = ({
  contactId,
}: ContactPaymentsOverviewProps) => {
  const [payments, setPayments] = useState<
    Partial<PaymentModel>[] | null
  >();
  const [formattedTableData, setFormattedTableData] = useState<any>([]);
  const [year, setYear] = useState(ALL_YEARS[0].value);
  const handleSelectYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
  }

  useEffect(() => {
    const mappedPayments = payments?.map((p) => {
      // Start with the common data for all rows
      const purchases = p.purchase?.calendarEditions?.map((c) => c.code).join(",");
      let rowData: any[] = [
        `$${Number(p.amount).toFixed(2)}`,
        p.paymentDate,
        p.paymentMethod || "",
        p.checkNumber || "",
        p.paymentOverview?.invoiceNumber || "",
        purchases || "",
      ];

      return rowData;
    });
    setFormattedTableData(mappedPayments || []);
  }, [payments, year]);

  useEffect(() => {
    const fetchContactPayments = async (cID: string) => {
      const payments = await getPaymentsByContactIdAndYear(cID, year);
      setPayments(payments);
    };
    fetchContactPayments(contactId);
  }, [year]);


  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <Table
          tableName="Payments"
          columns={defaultColumns}
          data={formattedTableData}
          filterValue={year}
          handleFilterChange={handleSelectYear}
          filterOptions={ALL_YEARS}

        />
      </section>
    </AnimateWrapper>
  );
};
export default ContactPaymentsOverview;
