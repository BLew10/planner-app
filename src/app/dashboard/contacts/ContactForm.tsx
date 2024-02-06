import styles from "./ContactForm.module.scss";
import TextInput from "@/app/(components)/form/TextInput";
import upsertContact from "@/actions/contact/upsertContact";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import CheckboxGroup from "@/app/(components)/form/CheckboxGroup";
import { getAllAddressBooks } from "@/lib/data/addressBook";
import SelectInput from "@/app/(components)/form/SelectInput";
import { COUNTRIES, STATES, CATEGORIES } from "@/lib/constants";

interface ContactProps {
  id?: number;
}

const Contact = async ({ id }: ContactProps) => {
  const addressBooks = await getAllAddressBooks();
  const checkboxData = addressBooks
    ?.filter((addressBook) => addressBook.name && addressBook.id != null) // Ensure both name and id exist
    .map((addressBook) => ({
      value: addressBook.id, // Assuming id is a number and needs to be a string
      label: addressBook.name,
    }));

  return (
    <AnimateWrapper>
      <h1 className={styles.heading}>{id ? "Edit" : "Add"} Contact</h1>
      <form action={upsertContact} className={styles.form}>
        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Telecom Information</h2>
          <div className={styles.inputGroup}>
            <TextInput name="phoneNumber" label="Phone Number" />
            <TextInput name="extension" label="Extension" />
            <TextInput name="altPhoneNumber" label="Alt Phone Number" />
          </div>
          <div className={styles.inputGroup}>
            <TextInput name="fax" label="Fax" />
            <TextInput name="cell" label="Cell" />
            <TextInput name="homePhone" label="Home Phone" />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="webAddress"
              label="Web Address"
              type="url"
              placeholder="https://example.com"
              pattern="^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$
"
            />
          </div>
        </div>
        {checkboxData && checkboxData?.length > 0 ? (
          <div className={styles.formGroup}>
            <h2 className={styles.groupHeader}>Address Books</h2>
            <CheckboxGroup name="addressBookIds" options={checkboxData} />
          </div>
        ) : (
          <p>No address books found</p>
        )}
        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Contact Information</h2>
          <div className={styles.inputGroup}>
            <TextInput name="contactFirstName" label="Contact First Name" />
            <TextInput name="contactLastName" label="Contact Last Name" />
          </div>
          <div className={styles.inputGroup}>
            <TextInput
              name="altContactFirstName"
              label="Alt Contact First Name"
            />
            <TextInput
              name="altContactLastName"
              label="Alt Contact Last Name"
            />
          </div>
          <div className={styles.inputGroup}>
            <TextInput name="salutation" label="Salutation" />
            <TextInput name="company" label="Company" />
          </div>
        </div>
        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Address Information</h2>
          <div className={styles.inputGroup}>
            <TextInput name="address1" label="Street Address 1" />
            <TextInput name="address2" label="Address Line 2" />
          </div>
          <div className={styles.inputGroup}>
            <TextInput name="city" label="City" />
            <SelectInput name="state" label="State" options={STATES} />
          </div>
          <div className={styles.inputGroup}>
            <TextInput name="zipCode" label="Zip Code" />
            <SelectInput name="country" label="Country" options={COUNTRIES} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <h2 className={styles.groupHeader}>Other</h2>
          <div className={styles.inputGroup}>
            <TextInput name="customerSince" label="Customer Since" />
            <SelectInput
              name="category"
              label="Category"
              options={CATEGORIES}
            />
          </div>
          <label htmlFor="notes" className={styles.label}>
            Notes
          </label>
          <textarea name="notes" id="notes" rows={4} cols={50} />
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default Contact;
