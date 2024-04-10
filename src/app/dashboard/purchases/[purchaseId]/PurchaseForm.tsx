"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Advertisement } from "@prisma/client";
import TextInput from "@/app/(components)/form/TextInput";
import styles from "./Purchase.module.scss";
import { AdvertisementPurchase, usePurchasesStore } from "@/store/purchaseStore";
import { Purchase } from "@/lib/data/purchase";
import { getContactById } from "@/lib/data/contact";
import { useSearchParams } from "next/navigation";

interface PurchaseProps {
  advertisementTypes: Partial<Advertisement>[] | null;
  purchase?: Partial<Purchase> | null;
}

interface AdvertisementType {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  companyName: string;
}

// State to manage each advertisement's input values
interface FormData {
  [key: string]: {
    id?: string;
    name?: string;
    quantity: string;
    charge: string;
    isDayType?: boolean;
  };
}
const Purchase: React.FC<PurchaseProps> = ({
  advertisementTypes = [],
  purchase = null,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseStore = usePurchasesStore();
  const [contact, setContact] = useState<Contact | null>(null);


  useEffect(() => {

    const savePurchaseData = (contact: Contact) => {
      let purchases: AdvertisementPurchase[] = [];
      if (purchase?.adPurchases) {
        purchases = purchase?.adPurchases
      } else if (purchaseStore.purchaseOverview?.purchases) {
        purchases = purchaseStore.purchaseOverview?.purchases as AdvertisementPurchase[];
      }
      purchaseStore.setPurchaseData({
        purchases: purchases,
        contactId: contact.id,
        companyName: contact?.companyName || "",
      });
     
    }

    const fetchContact = async (contactId: string) => {
      const contactData = await getContactById(contactId);
      if (!contactData) {
        router.push('/dashboard/contacts');
        return;
      }
      if (contactData) {
        const contact = {
          id: contactData.id,
          companyName: contactData.contactContactInformation?.company || "",
        }
        setContact(contact);
        savePurchaseData(contact);
      } else {
        router.push('/dashboard/contacts');
      }
    }
    const contactId = searchParams?.get("contactId");
    if (contactId) {
      fetchContact(contactId);
    } else {
      router.push('/dashboard/contacts');
    }
  }, [purchase, searchParams]);

  const [formData, setFormData] = useState<FormData>(() => {
    if (advertisementTypes) {
      const adPurchases = purchaseStore.purchaseOverview?.purchases?.reduce(
        (acc: Record<string, { quantity: string ; charge: string }>, curr) => {
          if (curr) {
            const { advertisementId } = curr;
            if (advertisementId) {
              acc[advertisementId] = { quantity: curr?.quantity?.toString() || "", charge: curr?.charge?.toString() || "" };
            }
          }
          return acc;
        },
        {}
      );

      return advertisementTypes.reduce(
        (acc: FormData, curr: Partial<AdvertisementType>) => {
          const { id } = curr;
          if (id) {
            const charge = adPurchases ? adPurchases[id]?.charge : "";
            const quantity = adPurchases ? adPurchases[id]?.quantity : "";
            acc[id] = {
              quantity, charge
            }
          }
          return acc;
        },
        {}
      );
    }
    return {};
  });


  const handleInputChange = (
    id: string,
    field: "quantity" | "charge",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contact?.id || !advertisementTypes) {
      return;
    }
    const adPurchaseSlots = purchase?.adPurchases?.reduce(
      (acc: Record<string, { slot: number; date: Date | null }[]>, curr) => {
        const { advertisement } = curr;
        if (advertisement) {
          acc[advertisement.id] = curr.slots || [];
        }
        return acc;
      },
      {}
    );

    const purchases: (AdvertisementPurchase | null)[] | null = advertisementTypes.filter((at) => at.id && formData[at.id]?.charge && formData[at.id]?.quantity)
      .map((at): AdvertisementPurchase | null => {
        if (at.id && formData[at.id]?.charge && formData[at.id]?.quantity) {
          return {
            advertisementId: at.id,
            name: at.name || "",
            quantity: parseInt(formData[at.id]?.quantity || "0", 10),
            charge: parseFloat(formData[at.id]?.charge || "0"),
            isDayType: at.isDayType || false,
            perMonth: at.perMonth || 0,
            slots: adPurchaseSlots ? adPurchaseSlots[at.id] : []
          };
        }
        return null;
      });
    if (purchases.length > 0) {
      purchaseStore.setPurchaseData({
        contactId: contact.id,
        companyName: contact.companyName || "",
        purchases,
      });
      router.push(`/dashboard/purchases/${purchase?.id || "add"}/details?contactId=${contact.id}`);
    }
  };
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>
        Purchase from <span className={styles.companyName}>{contact?.companyName}</span>
      </h2>
      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.formGroup}>
        {advertisementTypes
          ?.filter((at) => at.id != undefined)
          .map((at) => (
            <div key={at.id}>
              <h3 className={styles.advertisementName}>{at.name}</h3>
              <div className={styles.advertisement}>
                <TextInput
                  label="Quantity"
                  name={`quantity-${at.id}`}
                  type="number"
                  placeholder="Quantity"
                  value={at.id && formData[at.id]?.quantity}
                  onChange={(e) =>
                    at.id &&
                    handleInputChange(at.id, "quantity", e.target.value)
                  }
                />
                <TextInput
                  label="Charge"
                  name={`charge-${at.id}`}
                  type="text"
                  placeholder="Charge"
                  value={at.id && formData[at.id]?.charge}
                  onChange={(e) =>
                    at.id && handleInputChange(at.id, "charge", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <button type="submit" className={styles.submitButton}>
          { purchase?.id ? "Update" : "Create"} 
        </button>
      </form>
    </section>
  );
};

export default Purchase;
