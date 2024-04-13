"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AddressBook } from "@prisma/client";
import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getAllAddressBooks } from "@/lib/data/addressBook";
import deleteAddressBook from "@/actions/address-book/deleteAddressBook";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { toast, ToastContainer } from 'react-toastify';

const AddressBooksPage = () => {
  const [addressBooks, setAddressBooks] = useState<
    Partial<AddressBook>[] | null
  >();
  const [tableData, setTableData] = useState<any[]>();
  const successNotify = () => toast.success("Successfully Deleted");
  const errorNotify = () => toast.error("Something went wrong. Deletion failed");

  const onAddressBookDelete = async (addressBoodId?: string) => {
   const deleted = await deleteAddressBook(addressBoodId || "-1");
    const newAddressBooks = await getAllAddressBooks();
    const newMappedData = mapToTableData(newAddressBooks || []);
    setAddressBooks(newAddressBooks);
    setTableData(newMappedData);
    if (deleted) {
      successNotify();
    } else {
      errorNotify();
    }
    return deleted
  };
  const mapToTableData = (addressBooks: Partial<AddressBook>[]) => {
    return addressBooks?.map((addressBook) => {
      return [
        addressBook.name,
        addressBook.displayLevel,
        <div className={styles.modWrapper} key={addressBook.id}>
          <Link
            href={`/dashboard/address-books/${addressBook.id}`}
            className={styles.editAction}
          >
            Edit
          </Link>
          <DeleteButton
            title="Delete Address Book"
            onDelete={() =>  onAddressBookDelete(addressBook.id)}
            text={`Are you sure you want to delete ${addressBook.name}?`}
          />
        </div>,
      ];
    });
  };

  useEffect(() => {
    const fetchAddressBooks = async () => {
      const books = await getAllAddressBooks();
      const addressTableData = mapToTableData(books || []);
      setAddressBooks(books);
      setTableData(addressTableData);
    };
    fetchAddressBooks();
  }, []);

  const columns = [
    {
      name: "Name",
      size: "default",
    },
    {
      name: "Display Level",
      size: "default",
    },
    {
      name: "Actions",
      size: "default",
    },
  ];

  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <ToastContainer />
        <Table
          tableName="Address Books"
          columns={columns}
          data={tableData}
          addPath={"/dashboard/address-books/add"}
        />
      </section>
    </AnimateWrapper>
  );
};

export default AddressBooksPage;
