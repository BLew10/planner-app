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
import { createContactsCsv, downloadCsv, downloadXlsx } from "@/lib/helpers/contactCsv";

const ITEMS_PER_PAGE = 10;
type DownloadFormat = "csv" | "xlsx";

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

  const downloadContacts = (
    contactsToDownload: NonNullable<typeof contacts>,
    filename: string,
    format: DownloadFormat
  ) => {
    if (format === "xlsx") {
      downloadXlsx(contactsToDownload, `${filename}.xlsx`);
      return;
    }

    downloadCsv(createContactsCsv(contactsToDownload), `${filename}.csv`);
  };

  const handleDownloadCurrentPage = (format: DownloadFormat) => {
    downloadContacts(contacts || [], "contacts-current-page", format);
  };

  const handleDownloadAll = async (format: DownloadFormat) => {
    setIsDownloading(true);
    try {
      const allContacts = await getAllContactsByAddressBook(addressBookId, searchQuery);
      downloadContacts(allContacts, "contacts-all", format);
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
                <Button
                  className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500"
                  disabled={isDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Contacts
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadAll("xlsx")}>
                  Download all filtered contacts as XLSX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadAll("csv")}>
                  Download all filtered contacts as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadCurrentPage("xlsx")}>
                  Download current page as XLSX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadCurrentPage("csv")}>
                  Download current page as CSV
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
