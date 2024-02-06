import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getAllContacts } from "@/lib/data/contact";
import deleteAddressBook from "@/actions/address-book/deleteAddressBook";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { CATEGORIES } from "@/lib/constants";

const ContactsPage = async () => {
  const contacts = await getAllContacts();

  const columns = ["Name", "Company", "Address", "City", "State", "Zip", "Phone", "Ext", "Cell", "Email", "Web Address", "Customer Since", "Category", "Actions"];

  const data = contacts?.map((c) => {
    return [
      `${c.contactContactInformation?.firstName} ${c.contactContactInformation?.lastName}`,
      c.contactContactInformation?.company,
      c.contactAddress?.address,
      c.contactAddress?.city,
      c.contactAddress?.state,
      c.contactAddress?.zip,
      c.contactTelecomInformation?.phone,
      c.contactTelecomInformation?.extension,
      c.contactTelecomInformation?.cellPhone,
      <Link href={`mailto:${c.contactTelecomInformation?.email}`}>
        {c.contactTelecomInformation?.email}
      </Link>,
      <a rel="noopener noreferrer" href={`${c.webAddress}`}>
        {c.webAddress}
      </a>,
      c.customerSince,
      (c.category != "0" && c.category) ? CATEGORIES[parseInt(c.category || "0")].label : "",
      <div className={styles.modWrapper}>
        <Link
          href={`/dashboard/contacts/overview/${c.id}`}
          className={styles.overviewAction}
        >
          View
        </Link>
        <Link
          href={`/dashboard/contacts/${c.id}`}
          className={styles.editAction}
        >
          Edit
        </Link>
        <form action={deleteAddressBook}>
          <button type="submit" className={styles.deleteAction}>
            Delete
          </button>
          <input type="hidden" name="contactId" value={c.id} />
        </form>
      </div>,
    ];
  });

  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <Table tableName="Contacts" columns={columns} data={data} style='small' addPath="/dashboard/contacts/add" />
      </section>
    </AnimateWrapper>
  );
};

export default ContactsPage;
