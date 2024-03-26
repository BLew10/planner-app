import Link from "next/link";
import styles from "./page.module.scss";
import { MdCheck, MdOutlineCancel } from "react-icons/md";
import Table from "@/app/(components)/general/Table";
import { getAllPurchases } from "@/lib/data/purchase";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import deletePurchase from "@/actions/purchases/deletePurchase";

const PurchasesPage = async () => {
  const purhcases = await getAllPurchases();

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

  const data = purhcases?.map((p) => {
    return [
      p.companyName,
      `$${p.amountOwed?.toFixed(2)}`,
      p.calendarEdition,
      p.year,
      <div className={styles.paymentWrapper}>
        {p.paymentScheduled ?
          <MdCheck className={styles.paymentScheduled} />
         : <MdOutlineCancel className={styles.paymentPending} />}
      </div>,
      <div className={styles.modWrapper}>
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
        <form action={deletePurchase}>
          <button type="submit" className={styles.deleteAction}>
            Delete
          </button>
          <input type="hidden" name="purchaseId" value={p.id} />
        </form>
      </div>,
    ];
  });

  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <Table
          tableName="Purchases"
          columns={columns}
          data={data}
          addPath={"/dashboard/contacts"}
        />
      </section>
    </AnimateWrapper>
  );
};

export default PurchasesPage;
