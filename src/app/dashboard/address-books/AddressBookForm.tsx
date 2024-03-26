"use client";

import React, { useState } from "react";

import styles from "./AddressBookForm.module.scss";
import TextInput from "@/app/(components)/form/TextInput";
import SelectInput from "@/app/(components)/form/SelectInput";
import upsertAddressBook from "@/actions/address-book/upsertAddressBook";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";

interface AddressBookFormProps {
  addressBookName?: string | null;
  displayLevel?: string | null;
  id?: string | null;
}

const AddressBookForm = ({
  addressBookName,
  displayLevel,
  id
}: AddressBookFormProps) => {
  const [bookName, setBookName] = useState(addressBookName);
  const [level, setLevel] = useState(displayLevel);

  const handleBookNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookName(e.target.value);
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(e.target.value);
  };

  return (
    <AnimateWrapper>
    <form action={upsertAddressBook} className={styles.form}>
      <h2 className={styles.heading}>Create New Address Book</h2>
      <p className={styles.instructions}>
        To change the name of this Address Book, type the new name you wish to
        assign to it, then indicate the Display Level.
      </p>
      <TextInput
        name="addressBookName"
        label="Address Book Name"
        value={bookName}
        onChange={handleBookNameChange}
        isRequired={true}
      />
      <SelectInput
        name="displayLevel"
        label="Display Level"
        value={level}
        options={[
          { label: "Private", value: "private" },
          { label: "Share", value: "share" },
        ]}
        onChange={handleLevelChange}
      />
      {id && <input type="hidden" name="addressBookId" value={id} />}
      <button type="submit" className={styles.submitButton}>
        Submit
      </button>
    </form>
    </AnimateWrapper>
  );
};

export default AddressBookForm;
