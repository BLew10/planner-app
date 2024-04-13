"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AddressBookForm.module.scss";
import TextInput from "@/app/(components)/form/TextInput";
import SelectInput from "@/app/(components)/form/SelectInput";
import upsertAddressBook, {
  AddressBookFormData,
} from "@/actions/address-book/upsertAddressBook";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { toast, ToastContainer } from "react-toastify";

interface AddressBookFormProps {
  addressBookName?: string | null;
  displayLevel?: string | null;
  id?: string | null;
}

const AddressBookForm = ({
  addressBookName,
  displayLevel,
  id,
}: AddressBookFormProps) => {
  const [bookName, setBookName] = useState(addressBookName);
  const [requestPending, setRequestPending] = useState(false);
  const [level, setLevel] = useState(displayLevel);
  const router = useRouter();
  const notifyFailed = () =>
    toast.error("Something went wrong. Please try again.");

  const handleBookNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookName(e.target.value);
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRequestPending(true);
    const data: AddressBookFormData = {
      name: bookName || "",
      displayLevel: level || "Private",
    };
    
    const success = await upsertAddressBook(data, id);
    setRequestPending(false);
    if (success) {
      router.push("/dashboard/address-books");
    } else {
      notifyFailed();
    }
  };

  return (
    <AnimateWrapper>
      <ToastContainer />
      <form onSubmit={handleSubmit} className={styles.form}>
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
        <button
          type="submit"
          className={styles.submitButton}
          disabled={requestPending}
        >
          {requestPending ? "Saving..." : "Save"}
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default AddressBookForm;
