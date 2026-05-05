"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SimpleModal from "@/app/(components)/general/SimpleModal";
import { getAllContactsByAddressBook } from "@/lib/data/contact";
import { useContacts } from "@/hooks/contact/useContacts";
import { useAddressBooks } from "@/hooks/address-book/useAddressBooks";
import { ContactsTable } from "./ContactsTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { createContactsCsv, downloadCsv } from "@/lib/helpers/contactCsv";

const ITEMS_PER_PAGE = 10;

const ContactsPage = () => {
  const router = useRouter();
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { addressBookId, setAddressBookId, addressBooks } = useAddressBooks({ includeAllOption: true });

  const {
    contacts,
    selectedRows,
    setSelectedRows,
    currentPage,
    setCurrentPage,
    totalItems,
    searchQuery,
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

  const handleDownloadCurrentPage = () => {
    downloadCsv(createContactsCsv(contacts || []), "contacts-current-page.csv");
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      const allContacts = await getAllContactsByAddressBook(addressBookId, searchQuery);
      downloadCsv(createContactsCsv(allContacts), "contacts-all.csv");
    } finally {
      setIsDownloading(false);
    }
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
          actionContent={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isDownloading}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Contacts
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadAll}>
                  Download all filtered contacts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadCurrentPage}>
                  Download current page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      </section>
    </>
  );
};

export default ContactsPage;
