"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getContactsByAddressBook, ContactTableData } from "@/lib/data/contact";
import { getAllAddressBooks } from "@/lib/data/addressBook";
import deleteAddressBook from "@/actions/address-book/deleteAddressBook";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { CATEGORIES } from "@/lib/constants";
import { AddressBook } from "@prisma/client";

const ContactsPage = () => {
  const [contacts, setContacts] = useState<
    Partial<ContactTableData>[] | null
  >();
  const [addressBookId, setAddressBookId] = useState<string>("");
  const [addressBooks, setAddressBooks] = useState<
    Partial<AddressBook>[] | null
  >();

  const fetchContacts = async (addressBoodId: string) => {
    const contacts = await getContactsByAddressBook(addressBoodId);
    setContacts(contacts);
  };

  useEffect(() => {
    fetchAddressBooks();
    console.log(addressBookId);
    fetchContacts(addressBookId);
  }, [addressBookId]);

  const fetchAddressBooks = async () => {
    const addressBooks = await getAllAddressBooks();
    setAddressBooks(addressBooks);
  };

  const handleAddressBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddressBookId(e.target.value);
  };

  const columns = [
    {
      name: "Name",
      size: "default",
    },
    {
      name: "Company",
      size: "default",
    },
    {
      name: "Phone",
      size: "default",
    },
    {
      name: "Ext",
      size: "small",
    },
    {
      name: "Cell",
      size: "default",
    },
    {
      name: "Email",
      size: "default",
    },
    {
      name: "Web Address",
      size: "default",
    },
    {
      name: "Category",
      size: "default",
    },
    {
      name: "Actions",
      size: "default",
    },
  ];

  const addressBooksOptions = addressBooks?.map((ab) => {
    return {
      value: ab.id || "",
      label: ab.name || "",
    };
  });

  const data = contacts?.map((c) => {
    return [
      `${c.contactContactInformation?.firstName} ${c.contactContactInformation?.lastName}`,
      c.contactContactInformation?.company,
      c.contactTelecomInformation?.phone,
      c.contactTelecomInformation?.extension,
      c.contactTelecomInformation?.cellPhone,
      <Link href={`mailto:${c.contactTelecomInformation?.email}`}>
        {c.contactTelecomInformation?.email}
      </Link>,
      <a rel="noopener noreferrer" href={`${c.webAddress}`}>
        {c.webAddress}
      </a>,
      c.category != "0" && c.category
        ? CATEGORIES[parseInt(c.category || "0")].label
        : "",
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
        <Table
          tableName="Contacts"
          columns={columns}
          data={data}
          addPath="/dashboard/contacts/add"
          filterOptions={addressBooksOptions}
          handleFilterChange={handleAddressBookChange}
        />
      </section>
    </AnimateWrapper>
  );
};

export default ContactsPage;
