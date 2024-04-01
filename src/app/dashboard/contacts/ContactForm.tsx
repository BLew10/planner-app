import styles from "./ContactForm.module.scss";
import TextInput from "@/app/(components)/form/TextInput";
import upsertContact from "@/actions/contact/upsertContact";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import CheckboxGroup from "@/app/(components)/form/CheckboxGroup";
import { getAllAddressBooks } from "@/lib/data/addressBook";
import { getContactById } from "@/lib/data/contact";
import SelectInput from "@/app/(components)/form/SelectInput";
import { COUNTRIES, STATES, CATEGORIES } from "@/lib/constants";

interface ContactProps {
  id: string | null;
}

const ContactForm = async ({ id }: ContactProps) => {
  const contact = await getContactById(id as string);
  const contactAddressBooks =
    contact?.addressBooks.map((addressBook) => addressBook.id) || [];

  const addressBooks = await getAllAddressBooks();
  const checkboxData = addressBooks
    ?.filter((addressBook) => addressBook.name && addressBook.id)
    .map((addressBook) => ({
      value: addressBook.id,
      label: addressBook.name,
      checked: contactAddressBooks.includes(addressBook.id || ""),
    }));
  return (
    <AnimateWrapper>
      <h1 className={styles.heading}>{id ? "Edit" : "Add"} Contact</h1>
      <form action={upsertContact} className={styles.form}>
        {contact && <input type="hidden" name="contactId" value={contact.id} />}
        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Telecom Information</h2>
          <div className={styles.inputGroup}>
            <TextInput
              name="phoneNumber"
              label="Phone Number"
              value={contact?.contactTelecomInformation?.phone || ""}
            />
            <TextInput
              name="extension"
              label="Extension"
              value={contact?.contactTelecomInformation?.extension}
            />
            <TextInput
              name="altPhoneNumber"
              label="Alt Phone Number"
              value={contact?.contactTelecomInformation?.altPhone}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="fax"
              label="Fax"
              value={contact?.contactTelecomInformation?.fax}
            />
            <TextInput
              name="cell"
              label="Cell"
              value={contact?.contactTelecomInformation?.cellPhone}
            />
            <TextInput
              name="homePhone"
              label="Home Phone"
              value={contact?.contactTelecomInformation?.homePhone}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="webAddress"
              label="Web Address"
              type="url"
              placeholder="https://example.com"
              pattern="^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$"
              value={contact?.webAddress}
            />
            <TextInput
              name="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              pattern="^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,4}$"
              value={contact?.contactTelecomInformation?.email}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Address Books</h2>
          {checkboxData && checkboxData?.length > 0 ? (
            <CheckboxGroup name="addressBookIds" options={checkboxData} />
          ) : (
            <p className={styles.noAddressBooks}>No address books found</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Contact Information</h2>
          <div className={styles.inputGroup}>
            <TextInput
              name="contactFirstName"
              label="Contact First Name"
              value={contact?.contactContactInformation?.firstName}
              isRequired={true}
              title="Contact First Name is required"
            />
            <TextInput
              name="contactLastName"
              label="Contact Last Name"
              value={contact?.contactContactInformation?.lastName}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="altContactFirstName"
              label="Alt Contact First Name"
              value={contact?.contactContactInformation?.altContactFirstName}
            />
            <TextInput
              name="altContactLastName"
              label="Alt Contact Last Name"
              value={contact?.contactContactInformation?.altContactLastName}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="salutation"
              label="Salutation"
              value={contact?.contactContactInformation?.salutation}
            />
            <TextInput
              name="company"
              label="Company"
              value={contact?.contactContactInformation?.company}
              isRequired={true}
              title="Company is required"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Address Information</h2>
          <div className={styles.inputGroup}>
            <TextInput
              name="address1"
              label="Street Address 1"
              value={contact?.contactAddress?.address}
            />
            <TextInput
              name="address2"
              label="Address Line 2"
              value={contact?.contactAddress?.address2}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="city"
              label="City"
              value={contact?.contactAddress?.city}
            />
            <SelectInput
              name="state"
              label="State"
              options={STATES}
              value={contact?.contactAddress?.state}
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="zipCode"
              label="Zip Code"
              value={contact?.contactAddress?.city}
            />
            <SelectInput
              name="country"
              label="Country"
              options={COUNTRIES}
              value={contact?.contactAddress?.country}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Other</h2>
          <div className={styles.inputGroup}>
            <TextInput
              name="customerSince"
              label="Customer Since"
              value={contact?.customerSince}
            />
            <SelectInput
              name="category"
              label="Category"
              options={CATEGORIES}
              value={contact?.category}
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
            defaultValue={contact?.notes || ""}
          ></textarea>
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default ContactForm;
