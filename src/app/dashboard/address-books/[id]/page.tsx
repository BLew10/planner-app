import AddressBookForm from "../AddressBookForm";
import styles from "./page.module.scss";
import { getAddressBookById } from "@/lib/data/addressBook";

const UpdateAddressBookPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const { id } = params;

  const addressBook = await getAddressBookById(id as string);
  if (!addressBook) {
    return null;
  }

  return (
    <section className={styles.container}>
      <AddressBookForm
        addressBookName={addressBook?.name || ""}
        displayLevel={addressBook.displayLevel || "private"}
        id={addressBook.id || ""}
      />
    </section>
  );
};

export default UpdateAddressBookPage;
