"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import {
  getContactsByAddressBook,
  ContactTableData,
  deleteManyContacts,
} from "@/lib/data/contact";
import { getAllAddressBooks } from "@/lib/data/addressBook";
import deleteConact from "@/actions/contact/deleteContact";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import SimpleModal from "@/app/(components)/general/SimpleModal";
import { CATEGORIES } from "@/lib/constants";
import { AddressBook } from "@prisma/client";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { toast, ToastContainer } from "react-toastify";
import CheckboxInput from "@/app/(components)/form/CheckboxInput";

const firstOptionAddressBook: Partial<AddressBook> = {
  id: "-1",
  name: "All Address Books",
  displayLevel: "",
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

interface CheckedContacts {
  [key: string]: boolean;
}
const ContactsPage = () => {
  const [contacts, setContacts] = useState<
    Partial<ContactTableData>[] | null
  >();
  const [checkedContacts, setCheckedContacts] = useState<CheckedContacts>({});
  const [addressBookId, setAddressBookId] = useState<string>(
    firstOptionAddressBook.id || "-1"
  );
  const [selectAll, setSelectAll] = useState(false);
  const [addressBooks, setAddressBooks] = useState<
    Partial<AddressBook>[] | null
  >([firstOptionAddressBook]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [tableData, setTableData] = useState<any[]>();

  const [openEmailModal, setOpenEmailModal] = useState(false);
  const successNotify = () => toast.success("Successfully Deleted");
  const errorNotify = () =>
    toast.error("Something went wrong. Deletion failed");

  const fetchContacts = async (addressBookId: string) => {
    const contacts = await getContactsByAddressBook(addressBookId);
    setContacts(contacts);
    const newCheckedContacts: CheckedContacts = {};
    contacts?.forEach((contact) => {
      if (contact.id) {
        newCheckedContacts[contact.id] = false;
      }
    });
    setCheckedContacts(newCheckedContacts);
  };
  useEffect(() => {
    fetchAddressBooks();
  }, []);

  useEffect(() => {
    fetchContacts(addressBookId);
  }, [addressBookId]);

  useEffect(() => {
    const newSelectedCount = Object.values(checkedContacts).filter(Boolean).length;
    setSelectedCount(newSelectedCount);
  }, [checkedContacts]);

  useEffect(() => {
    const newTableData = contacts?.map((c) => {
      const name = `${c.contactContactInformation?.firstName} ${c.contactContactInformation?.lastName}`.trim();
      return [
        <div
          key={c.id}
          dataset-search={name}
        >
          <CheckboxInput
            name="contacts"
            value={c.id}
            checked={!!checkedContacts[c.id as string]}
            onChange={() => handleCheckboxChange(c.id as string)}
            label={
              <Link
                href={`/dashboard/contacts/${c.id}/overview`}
                className={styles.contactLink}
                key={c.id}
              >{name || "No Name"}</Link>
            }
          />
        </div>,
        c.contactContactInformation?.company,
        c.contactTelecomInformation?.phone,
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
    setTableData(newTableData);
  }, [contacts, checkedContacts]);

  const fetchAddressBooks = async () => {
    let userAddressBooks = await getAllAddressBooks();
    userAddressBooks?.unshift(firstOptionAddressBook);
    setAddressBooks(userAddressBooks);
  };

  const onContactDelete = async (contactId?: string) => {
    const deleted = await deleteConact(contactId || "-1");
    fetchContacts(addressBookId);
    if (deleted) {
      successNotify();
    } else {
      errorNotify();
    }
    return deleted;
  };

  const handleAddressBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddressBookId(e.target.value);
  };
  const handleCheckboxChange = (contactId: string) => {
    setCheckedContacts((prev) => ({
      ...prev,
      [contactId]: !prev[contactId],
    }));
  };

  const toggleAllCheckboxes = () => {
    const toggledSelectAll = !selectAll;
    setSelectAll(toggledSelectAll);
    const newChecked: CheckedContacts = {};
    contacts?.forEach((contact) => {
      if (contact.id) {
        newChecked[contact.id] = toggledSelectAll;
      }
    });
    setCheckedContacts(newChecked);
  };

  const deleteSelectedContacts = async () => {
    const contactIds = Object.keys(checkedContacts).filter(
      (id) => checkedContacts[id]
    );
    const deleted = await deleteManyContacts(contactIds);
    fetchContacts(addressBookId);
    if (deleted) {
      successNotify();
      setCheckedContacts((prev) => {
        const newChecked = { ...prev };
        contactIds.forEach((id) => delete newChecked[id]);
        return newChecked;
      });
    } else {
      errorNotify();
    }
  };
  const addressBooksOptions = addressBooks?.map((ab) => {
    return {
      value: ab.id || "",
      label: ab.name || "",
    };
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
          <ToastContainer />
          <Table
            tableName="Contacts"
            columns={columns}
            data={tableData}
            addPath="/dashboard/contacts/add"
            filterOptions={addressBooksOptions}
            handleFilterChange={handleAddressBookChange}
            selectedAction={deleteSelectedContacts}
            selectActionDescription="Delete"
            selectedCount={selectedCount}
            toggleSelectAll={toggleAllCheckboxes}
            allSelected={selectAll}
          />
        </section>
      </AnimateWrapper>
    </>
  );
};

export default ContactsPage;
