"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getContactsByAddressBook, ContactTableData } from "@/lib/data/contact";
import { getAllAddressBooks } from "@/lib/data/addressBook";
import deleteConact from "@/actions/contact/deleteContact";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import SimpleModal from "@/app/(components)/general/SimpleModal";
import { CATEGORIES } from "@/lib/constants";
import { AddressBook } from "@prisma/client";
import DeleteButton from "@/app/(components)/general/DeleteButton";

const firstOptionAddressBook: Partial<AddressBook> = {
  id: "-1",
  name: "All Address Books",
  displayLevel: "",
};

const ContactsPage = () => {
  const [contacts, setContacts] = useState<
    Partial<ContactTableData>[] | null
  >();
  const [addressBookId, setAddressBookId] = useState<string>(
    firstOptionAddressBook.id || "-1"
  );
  const [addressBooks, setAddressBooks] = useState<
    Partial<AddressBook>[] | null
  >([firstOptionAddressBook]);

  const [openEmailModal, setOpenEmailModal] = useState(false);

  const fetchContacts = async (addressBookId: string) => {
    const contacts = await getContactsByAddressBook(addressBookId);
    setContacts(contacts);
  };

  useEffect(() => {
    fetchAddressBooks();
  }, []);

  useEffect(() => {
    fetchContacts(addressBookId);
  }, [addressBookId]);

  const fetchAddressBooks = async () => {
    let userAddressBooks = await getAllAddressBooks();
    userAddressBooks?.unshift(firstOptionAddressBook);
    setAddressBooks(userAddressBooks);
  };

  const onContactDelete = async (contactId?: string) => {
    await deleteConact(contactId || "-1");
    const newContacts = await getContactsByAddressBook(addressBookId);
    setContacts(newContacts);
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
      <Link
        href={`/dashboard/contacts/${c.id}/overview`}
        className={styles.contactLink}
        key={c.id}
        dataset-search={`${c.contactContactInformation?.firstName} ${c.contactContactInformation?.lastName}`}
      >{`${c.contactContactInformation?.firstName} ${c.contactContactInformation?.lastName}`}</Link>,
      c.contactContactInformation?.company,
      c.contactTelecomInformation?.phone,
      c.contactTelecomInformation?.extension,
      c.contactTelecomInformation?.cellPhone,
      <Link
        href={`mailto:${c.contactTelecomInformation?.email}`}
        key={c.id}
        dataset-search={`${c.contactTelecomInformation?.email}`}
      >
        {c.contactTelecomInformation?.email}
      </Link>,
      <a
        rel="noopener noreferrer"
        href={`${c.webAddress}`}
        key={c.id}
        dataset-search={`${c.webAddress}`}
      >
        {c.webAddress}
      </a>,
      c.category != "0" && c.category
        ? CATEGORIES[parseInt(c.category || "0")].label
        : "",
      <div className={styles.modWrapper} key={c.id}>
        <Link
          href={`/dashboard/purchases/add?contactId=${c.id}`}
          className={styles.purchaseAction}
        >
          Add Purchase
        </Link>
        <Link
          href={`/dashboard/payments/add?contactId=${c.id}`}
          className={styles.paymentAction}
          onClick={(e) => {
            if (!c.contactTelecomInformation?.email) {
              e.preventDefault();
              e.stopPropagation();
              setOpenEmailModal(true);
            } else {
              setOpenEmailModal(false);
            }
          }}
        >
          Add Payment
        </Link>
        <Link
          href={`/dashboard/contacts/${c.id}`}
          className={styles.editAction}
        >
          Edit
        </Link>
        <DeleteButton
          title="Delete Contact"
          onDelete={() => onContactDelete(c.id)}
          text={`Are you sure you want to delete ${c.contactContactInformation?.company}?`}
        />
      </div>,
    ];
  });

  return (
    <>
      {openEmailModal && (
        <SimpleModal
          isOpen={openEmailModal}
          closeModal={() => setOpenEmailModal(false)}
          title="Invalid Email"
          text="A valid email is needed to create a payment. Please add an email and try again."
        />
      )}
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
    </>
  );
};

export default ContactsPage;
