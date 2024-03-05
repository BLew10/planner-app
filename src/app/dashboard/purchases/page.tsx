import Link from "next/link";
import styles from "./page.module.scss";
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
      name: "Cost",
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
      p.amountOwed,
      <div className={styles.modWrapper}>
        <Link
          href={`/dashboard/contacts/${p.contactId}/purchase/${p.id}`}
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
        <Table tableName="Purchases" columns={columns} data={data} addPath={'/dashboard/contacts'} />
      </section>
    </AnimateWrapper>
  );
};

export default PurchasesPage;
