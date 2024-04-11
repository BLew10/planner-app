"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Advertisement } from "@prisma/client";
import TextInput from "@/app/(components)/form/TextInput";
import styles from "./Purchase.module.scss";
import { usePurchasesStore } from "@/store/purchaseStore";
import { AdvertisementPurchaseModel } from "@/lib/models/advertisementPurchase";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import { AdvertisementPurchaseSlotModel } from "@/lib/models/advertisementPurchaseSlots";
import { ContactModel } from "@/lib/models/contact";
import { getContactById } from "@/lib/data/contact";
import { useSearchParams } from "next/navigation";
import { AdvertisementModel } from "@/lib/models/advertisment";

interface PurchaseProps {
  advertisementTypes: Partial<Advertisement>[];
  purchase?: Partial<PurchaseOverviewModel> | null;
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
  advertisementTypes,
  purchase = null,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseStore = usePurchasesStore();
  const [contact, setContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<FormData>();


  useEffect(() => {

    const savePurchaseData = (contactData: Partial<ContactModel>) => {
      let purchases: Partial<AdvertisementPurchaseModel>[] = [];
      if (purchase?.adPurchases) {
        purchases = purchase?.adPurchases
      } else if (purchaseStore.purchaseOverview?.purchases) {
        purchases = purchaseStore.purchaseOverview?.purchases as AdvertisementPurchaseModel[];
      }
      purchaseStore.setPurchaseData({
        purchases: purchases,
        contactId: contactData.id,
        companyName: contactData?.contactContactInformation?.company || "",
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
          id: contactData.id as string,
          companyName: contactData.contactContactInformation?.company || "",
        }
        setContact(contact);
        savePurchaseData(contactData);
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

  useEffect(() => {
    if (purchaseStore.purchaseOverview?.purchases && purchaseStore.purchaseOverview?.purchases.length > 0) {
      const newFormData = initializeFormData(advertisementTypes, purchaseStore.purchaseOverview.purchases);
      setFormData(newFormData);
    }
  }, [purchaseStore.purchaseOverview?.purchases, advertisementTypes]);

  const initializeFormData = (advertisementTypes: Partial<Advertisement>[], purchases: (Partial<AdvertisementPurchaseModel> | null)[]) => {
    const adPurchases = purchases?.reduce((acc: Record<string, { quantity: string ; charge: string }>, curr) => {
        if (curr) {
          const { advertisement } = curr;
          if (advertisement?.id) {
            acc[advertisement.id] = { quantity: curr?.quantity?.toString() || "", charge: curr?.charge?.toString() || "" };
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


  const handleInputChange = (
    id: string,
    field: "quantity" | "charge",
    value: string
  ) => {
    setFormData((prev) => {
      if (!prev) {
        return {}; 
      }
    
      return {
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value,
        },
      };
    });
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contact?.id || !advertisementTypes) {
      return;
    }
    const adPurchaseSlots = purchase?.adPurchases?.reduce(
      (acc: Record<string, Partial<AdvertisementPurchaseSlotModel>[]>, curr) => {
        const { advertisement } = curr;
        if (advertisement?.id) {
          acc[advertisement.id] = curr.adPurchaseSlots || [];
        }
        return acc;
      },
      {}
    );

    interface PurchaseDetailsData {
      advertisementId?: string;
      quantity?: number;
      charge?: number;
      adPurchaseSlots?: Partial<AdvertisementPurchaseSlotModel>[];
      advertisement?: Partial<AdvertisementModel>;
    }

    const purchases: (Partial<PurchaseDetailsData> | null)[] | null = advertisementTypes.filter((at) => at.id && formData && formData[at.id]?.charge && formData[at.id]?.quantity)
      .map((a) => {
        if (a.id && formData && formData[a.id]?.charge && formData[a.id]?.quantity) {
          return {
            advertisementId: a.id,
            quantity: parseInt(formData[a.id]?.quantity || "0", 10),
            charge: parseFloat(formData[a.id]?.charge || "0"),
            adPurchaseSlots: adPurchaseSlots ? adPurchaseSlots[a.id] : [],
            advertisement: a
          };
        }
        return null;
      });
    if (purchases.length > 0) {
      purchaseStore.setPurchaseData({
        contactId: contact.id,
        companyName: contact?.companyName || "",
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
                  value={at.id && formData && formData[at.id]?.quantity}
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
                  value={at.id && formData && formData[at.id]?.charge}
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
