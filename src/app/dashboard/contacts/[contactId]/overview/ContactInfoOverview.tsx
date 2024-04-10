import { ContactModel } from "@/lib/models/contact";
import styles from "./ContactInfoOverview.module.scss";
import { CATEGORIES } from "@/lib/constants";

interface ContactInfoOverviewProps {
  contact: Partial<ContactModel>  | null;
}

const ContactInfoOverview = ({ contact }: ContactInfoOverviewProps) => {
  const category = CATEGORIES.find((category) => contact?.category != "0" && category.value == contact?.category)?.label;
  return (
      <div className={styles.contact}>
        <div className={styles.telecomInfo}>
          <h2 className={styles.groupHeader}>Telecom Information</h2>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Phone Number: </span>
            <span className={styles.info}>
              {contact?.contactTelecomInformation?.phone}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Alt Phone Number: </span>
            <span className={styles.info}>
              {contact?.contactTelecomInformation?.altPhone}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Home Phone Number: </span>
            <span className={styles.info}>
              {contact?.contactTelecomInformation?.homePhone}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Email: </span>
            <span className={styles.info}>
              {contact?.contactTelecomInformation?.email}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Website: </span>
            <span className={styles.info}>{contact?.webAddress}</span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Extension: </span>
            <span className={styles.info}>
              {contact?.contactTelecomInformation?.extension}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Fax</span>
            <span className={styles.info}>
              {contact?.contactTelecomInformation?.fax}
            </span>
          </div>
        </div>
        <div className={styles.contactInfo}>
          <h2 className={styles.groupHeader}>Contact Information</h2>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Contact Name: </span>
            <span className={styles.info}>
              {contact?.contactContactInformation?.firstName}{" "}
              {contact?.contactContactInformation?.lastName}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Alt Contact Name: </span>
            <span className={styles.info}>
              {contact?.contactContactInformation?.altContactFirstName}{" "}
              {contact?.contactContactInformation?.altContactLastName}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Salutation:</span>
            <span className={styles.info}>
              {contact?.contactContactInformation?.salutation}
            </span>
          </div>
        </div>
        <div className={styles.addressInfo}>
          <h2 className={styles.groupHeader}>Address Information</h2>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Address Line 1: </span>
            <span className={styles.info}>
              {contact?.contactAddress?.address}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Address Line 2: </span>
            <span className={styles.info}>
              {contact?.contactAddress?.address2}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>City: </span>
            <span className={styles.info}>{contact?.contactAddress?.city}</span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>State: </span>
            <span className={styles.info}>
              {contact?.contactAddress?.state}
            </span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Zip: </span>
            <span className={styles.info}>{contact?.contactAddress?.zip}</span>
          </div>
        </div>
        <div className={styles.other}>
          <h2 className={styles.groupHeader}>Other</h2>
                    
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Category: </span>
            <span className={styles.info}>{category || ""}</span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Customer Since: </span>
            <span className={styles.info}>{contact?.customerSince}</span>
          </div>
          <div className={styles.infoWrapper}>
            <span className={styles.label}>Notes: </span>
            <span className={styles.info}>{contact?.notes}</span>
          </div>
        </div>
      </div>
  );
};

export default ContactInfoOverview;
