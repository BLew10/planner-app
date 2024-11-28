import { useState, useEffect } from "react";
import { AddressBook } from "@prisma/client";
import { getAllAddressBooks } from "@/lib/data/addressBook";

const firstOptionAddressBook: Partial<AddressBook> = {
  id: "-1",
  name: "All Address Books",
  displayLevel: "",
};

interface UseAddressBooksOptions {
  includeAllOption: boolean;
}

export const useAddressBooks = (options: UseAddressBooksOptions = { includeAllOption: true }) => {
  const [addressBookId, setAddressBookId] = useState<string>(
    options.includeAllOption ? firstOptionAddressBook.id || "-1" : ""
  );
  const [addressBooks, setAddressBooks] = useState<Partial<AddressBook>[] | null>(
    options.includeAllOption ? [firstOptionAddressBook] : []
  );

  const fetchAddressBooks = async () => {
    let userAddressBooks = await getAllAddressBooks();
    if (options.includeAllOption) {
      userAddressBooks?.unshift(firstOptionAddressBook);
    }
    setAddressBooks(userAddressBooks);
  };

  useEffect(() => {
    fetchAddressBooks();
  }, []);

  return {
    addressBookId,
    setAddressBookId,
    addressBooks,
    fetchAddressBooks,
  };
};