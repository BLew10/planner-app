"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getContactById } from "@/lib/data/contact";
import { ContactModel } from "@/lib/models/contact";
import styles from "./ContactOverview.module.scss";
import ContactInfoOverview from "./ContactInfoOverview";
import ContactPurchasesOverview from "./ContactPurchasesOverview";
import ContactPaymentsOverview from "./ContactPaymentsOverview";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";

interface ContactOverviewProps {
  contactId: string;
}

const isTesting = process.env.VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_IS_TESTING === 'true';

type ContactOverviewTabs = "info" | "purchases" | "payments";
const ContactOverview = ({ contactId }: ContactOverviewProps) => {
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);
  const [contact, setContact] = useState<Partial<ContactModel>>();
  const [activeTab, setActiveTab] = useState<ContactOverviewTabs>("info");
  useEffect(() => {
    const fetchContact = async (id: string) => {
      setRequesting(true);
      const contactData = await getContactById(id);
      if (!contactData) {
        router.push("/dashboard/contacts");
        return;
      }
      setRequesting(false);
      setContact(contactData);
    };
    fetchContact(contactId);
  }, [contactId, router]);
  if (requesting) return <LoadingSpinner />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.contactHeader}>
          <h1 className={styles.heading}>
            {contact
              ? contact?.contactContactInformation?.company ||
                contact?.contactContactInformation?.firstName +
                  " " +
                  contact?.contactContactInformation?.lastName
              : ""}
          </h1>
          <Link
            href={`/dashboard/contacts/${contact?.id}`}
            className={styles.edit}
          >
            Edit
          </Link>
        </div>
        {contact?.stripeCustomerId && (
          <a
            href={`https://dashboard.stripe.com/${
              isTesting ? "test/" : ""
            }customers/${contact?.stripeCustomerId}`}
            className={styles.stripeLink}
            rel="noreferrer noopener"
            target="_blank"
          >
            Stripe Profile
          </a>
        )}
      </div>
      <div className={styles.contactTabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "info" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("info")}
        >
          Contact Info
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "purchases" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("purchases")}
        >
          Purchases
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "payments" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("payments")}
        >
          Payments
        </button>
      </div>
      {activeTab === "info" && (
        <ContactInfoOverview contact={contact as ContactModel} />
      )}
      {activeTab === "purchases" && (
        <ContactPurchasesOverview contactId={contactId} />
      )}
      {activeTab === "payments" && (
        <ContactPaymentsOverview contactId={contactId} />
      )}
    </div>
  );
};

export default ContactOverview;
