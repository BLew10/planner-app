import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/general/Table";
import { getAllAddressBooks } from "@/data/addressBook";
import deleteAddressBook from "@/actions/address-book/deleteAddressBook";
import AnimateWrapper from "@/general/AnimateWrapper";

const AddressBooksPage = async () => {
  const addressBooks = await getAllAddressBooks();

  const columns = ["Name", "Display Level", "Modify"];

  const data = addressBooks?.map((addressBook) => {
    return [
      addressBook.name,
      addressBook.displayLevel,
      <div className={styles.modWrapper}>
        <Link
          href={`/dashboard/address-books/${addressBook.id}`}
          className={styles.editButton}
        >
          Edit
        </Link>
        <form action={deleteAddressBook}>
          <button type="submit" className={styles.deleteButton}>
            Delete
          </button>
          <input type="hidden" name="addressId" value={addressBook.id} />
        </form>
      </div>,
    ];
  });

  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <Table tableName="Address Books" columns={columns} data={data} />
      </section>
    </AnimateWrapper>
  );
};

export default AddressBooksPage;
