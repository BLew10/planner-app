"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SimpleModal from "@/app/(components)/general/SimpleModal";
import { ContactTableData } from "@/lib/data/contact";
import { useContacts } from "@/hooks/contact/useContacts";
import { useAddressBooks } from "@/hooks/address-book/useAddressBooks";
import { ContactsTable } from "./ContactsTable";

const ITEMS_PER_PAGE = 10;

const ContactsPage = () => {
  const router = useRouter();
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const { addressBookId, setAddressBookId, addressBooks } = useAddressBooks({ includeAllOption: true });

  const {
    contacts,
    selectedRows,
    setSelectedRows,
    currentPage,
    setCurrentPage,
    totalItems,
    setSearchQuery,
    isLoading,
    deleteSelectedContacts,
    onContactDelete,
  } = useContacts({
    itemsPerPage: ITEMS_PER_PAGE,
    addressBookId,
  });

  const handleAddressBookChange = (value: string) => {
    setAddressBookId(value);
    setCurrentPage(1);
  };

  return (
    <>
      <SimpleModal
        isOpen={openEmailModal}
        closeModal={() => setOpenEmailModal(false)}
        title="Invalid Email"
        text="A valid email is needed to create a payment. Please add an email and try again."
      />
      <section className="container mx-auto px-4 w-full mt-10">
        <ContactsTable
          contacts={contacts || []}
          isLoading={isLoading}
          addressBooks={addressBooks?.map((book) => ({
            label: book.name || "",
            value: book.id || "",
          })) || []}
          onFilterChange={handleAddressBookChange}
          onSearch={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          onContactDelete={onContactDelete}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          onDeleteSelected={deleteSelectedContacts}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onAdd={() => router.push("/dashboard/contacts/add")}
        />
      </section>
    </>
  );
};

export default ContactsPage;
