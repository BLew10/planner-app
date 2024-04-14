"use client";

import React, { useState, useEffect } from "react";
import styles from "./ContactForm.module.scss";
import TextInput from "@/app/(components)/form/TextInput";
import upsertContact, {
  ContactFormData,
} from "@/actions/contact/upsertContact";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import CheckboxGroup from "@/app/(components)/form/CheckboxGroup";
import { getAllAddressBooks } from "@/lib/data/addressBook";
import { getContactById } from "@/lib/data/contact";
import SelectInput from "@/app/(components)/form/SelectInput";
import { COUNTRIES, STATES, CATEGORIES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

interface ContactProps {
  id: string | null;
}

const ContactForm = ({ id }: ContactProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<ContactFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressBooks, setAddressBooks] = useState<
    { value: string; label: string; checked: boolean }[] | null
  >(null);
  const notifyError = () =>
    toast.error("Something went wrong. Please try again.");

  useEffect(() => {
    if (id) {
      getContactById(id).then((contact) => {
        console.log(contact);
        if (contact) {
          setFormData({
            customerSince: contact.customerSince || "",
            notes: contact.notes || "",
            category: contact.category || "0",
            webAddress: contact.webAddress || "",
            firstName: contact.contactContactInformation?.firstName || "",
            lastName: contact.contactContactInformation?.lastName || "",
            altContactFirstName:
              contact.contactContactInformation?.altContactFirstName || "",
            altContactLastName:
              contact.contactContactInformation?.altContactLastName || "",
            salutation: contact.contactContactInformation?.salutation || "",
            company: contact.contactContactInformation?.company || "",
            extension: contact.contactTelecomInformation?.extension || "",
            phone: contact.contactTelecomInformation?.phone || "",
            altPhone: contact.contactTelecomInformation?.altPhone || "",
            fax: contact.contactTelecomInformation?.fax || "",
            email: contact.contactTelecomInformation?.email || "",
            cellPhone: contact.contactTelecomInformation?.cellPhone || "",
            homePhone: contact.contactTelecomInformation?.homePhone || "",
            address: contact.contactAddress?.address || "",
            address2: contact.contactAddress?.address2 || "",
            city: contact.contactAddress?.city || "",
            state: contact.contactAddress?.state || "",
            country: contact.contactAddress?.country || "",
            zip: contact.contactAddress?.zip || "",
            addressBooksIds: contact.addressBooks || [],
          });
        }
      });
    }
  }, [id]);

  useEffect(() => {
    getAllAddressBooks().then((addressBooks) => {
      const mappedAddressBooks = addressBooks?.map((addressBook) => {
        return {
          value: addressBook.id as string,
          label: addressBook.name as string,
          checked: formData?.addressBooksIds?.some(
            (address) => address.id === addressBook.id
          ) || false,
        };
      });
      if (!mappedAddressBooks || mappedAddressBooks.length === 0) return;
      setAddressBooks(mappedAddressBooks);
    });
  }, [formData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const addressBooks = document.getElementsByName("addressBookIds") as NodeListOf<HTMLInputElement>;
    const addressBooksIds = Array.from(addressBooks)
      .filter((addressBook) => addressBook.checked)
      .map((addressBook) => {
        return { id: addressBook.value };
      });

    const submissionData: ContactFormData = {
      customerSince: formData?.customerSince || "",
            notes: formData?.notes || "",
            category: formData?.category || "",
            webAddress: formData?.webAddress || "",
            firstName: formData?.firstName || "",
            lastName: formData?.lastName || "",
            altContactFirstName:
              formData?.altContactFirstName || "",
            altContactLastName:
              formData?.altContactLastName || "",
            salutation: formData?.salutation || "",
            company: formData?.company || "",
            extension: formData?.extension || "",
            phone: formData?.phone || "",
            altPhone: formData?.altPhone || "",
            fax: formData?.fax || "",
            email: formData?.email || "",
            cellPhone: formData?.cellPhone || "",
            homePhone: formData?.homePhone || "",
            address: formData?.address || "",
            address2: formData?.address2 || "",
            city: formData?.city || "",
            state: formData?.state || "",
            country: formData?.country || "",
            zip: formData?.zip || "",
            addressBooksIds
    };

    if (!submissionData)  {
      setIsSubmitting(false);
      return;
    };
    const success = await upsertContact(submissionData, id);
    setIsSubmitting(false);
    if (success) {
      router.push("/dashboard/contacts");
    } else {
      notifyError();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }) as ContactFormData);
  };

  return (
    <AnimateWrapper>
      <ToastContainer />
      <h1 className={styles.heading}>{id ? "Edit" : "Add"} Contact</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Telecom Information</h2>
          <div className={styles.inputGroup}>
            <TextInput
              name="phone"
              label="Phone Number"
              value={formData?.phone}
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              title="Phone number must be in the format XXX-XXX-XXXX"
              subLabel="(XXX-XXX-XXXX)"
              placeholder="123-456-7890"
              onChange={handleInputChange}
            />
            <TextInput
              name="extension"
              label="Extension"
              value={formData?.extension}
              onChange={handleInputChange}
            />
            <TextInput
              name="altPhone"
              label="Alt Phone Number"
              value={formData?.altPhone}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="fax"
              label="Fax"
              value={formData?.fax}
              onChange={handleInputChange}
            />
            <TextInput
              name="cellPhone"
              label="Cell"
              value={formData?.cellPhone}
              title="Cell must be in the format XXX-XXX-XXXX"
              placeholder="123-456-7890"
              onChange={handleInputChange}
            />
            <TextInput
              name="homePhone"
              label="Home Phone"
              value={formData?.homePhone}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="webAddress"
              label="Web Address"
              type="url"
              placeholder="https://example.com"
              value={formData?.webAddress}
              onChange={handleInputChange}
            />
            <TextInput
              name="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              pattern="^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,4}$"
              isRequired={true}
              title="Email is required"
              value={formData?.email}
              subLabel="Verify the email address is valid"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Address Books</h2>
          {addressBooks && addressBooks?.length > 0 ? (
            <CheckboxGroup
              name="addressBookIds"
              options={addressBooks}
            />
          ) : (
            <p className={styles.noAddressBooks}>No address books found</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Contact Information</h2>
          <div className={styles.inputGroup}>
            <TextInput
              name="firstName"
              label="Contact First Name"
              value={formData?.firstName}
              isRequired={true}
              title="Contact First Name is required"
              onChange={handleInputChange}
            />
            <TextInput
              name="lastName"
              label="Contact Last Name"
              value={formData?.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="altContactFirstName"
              label="Alt Contact First Name"
              value={formData?.altContactFirstName}
              onChange={handleInputChange}
            />
            <TextInput
              name="altContactLastName"
              label="Alt Contact Last Name"
              value={formData?.altContactLastName}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="salutation"
              label="Salutation"
              value={formData?.salutation}
              onChange={handleInputChange}
            />
            <TextInput
              name="company"
              label="Company"
              value={formData?.company}
              onChange={handleInputChange}
              isRequired={true}
              title="Company is required"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Address Information</h2>
          <div className={styles.inputGroup}>
            <TextInput
              name="address"
              label="Street Address 1"
              value={formData?.address}
              onChange={handleInputChange}
            />
            <TextInput
              name="address2"
              label="Address Line 2"
              value={formData?.address2}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="city"
              label="City"
              value={formData?.city}
              onChange={handleInputChange}
            />
            <SelectInput
              name="state"
              label="State"
              options={STATES}
              onChange={handleInputChange}
              value={formData?.state}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="zip"
              label="Zip Code"
              value={formData?.zip }
              onChange={handleInputChange}
            />
            <SelectInput
              name="country"
              label="Country"
              options={COUNTRIES}
              value={formData?.country}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Other</h2>
          <div className={styles.inputGroup}>
            <TextInput
              name="customerSince"
              label="Customer Since"
              value={formData?.customerSince}
              onChange={handleInputChange}
            />
            <SelectInput
              name="category"
              label="Category"
              options={CATEGORIES}
              value={formData?.category}
              onChange={handleInputChange}
            />
          </div>
          <label htmlFor="notes" className={styles.label}>
            Notes
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={4}
            cols={50}
            defaultValue={formData?.notes || ""}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default ContactForm;
