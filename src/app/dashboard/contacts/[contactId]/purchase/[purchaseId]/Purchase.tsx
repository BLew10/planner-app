"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContactTableData } from "@/lib/data/contact";
import { Advertisement } from "@prisma/client";
import TextInput from "@/app/(components)/form/TextInput";
import styles from "./Purchase.module.scss";
import { AdvertisementPurchase, usePurchasesStore } from "@/store/purchaseStore";
import { Purchase } from "@/lib/data/purchase";

interface PurchaseProps {
  contact: Partial<ContactTableData> | null;
  advertisementTypes: Partial<Advertisement>[] | null;
  purchase?: Partial<Purchase> | null;
}

interface AdvertisementType {
  id: string;
  name: string;
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
  contact,
  advertisementTypes = [],
  purchase = null,
}) => {
  const router = useRouter();
  const purchaseStore = usePurchasesStore();

  const savePurchaseData = () => {
    purchaseStore.setPurchaseData({
      purchases: purchase?.adPurchases || [],
      contactId: contact?.id,
      companyName: contact?.contactContactInformation?.company || "",
    });
  }

  useEffect(() => {
    savePurchaseData();
  }, [contact, purchase]);

  const [formData, setFormData] = useState<FormData>(() => {
    if (advertisementTypes) {
      const adPurchases = purchase?.adPurchases?.reduce(
        (acc: Record<string, { quantity: string ; charge: string }>, curr) => {
          const { advertisement } = curr;
          if (advertisement) {
            acc[advertisement.id] = { quantity: curr.quantity.toString(), charge: curr.charge.toString() };
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
        companyName: contact.contactContactInformation?.company || "",
        purchases,
      });
      router.push(`/dashboard/contacts/${contact.id}/purchase/${purchase?.id || "new"}/details`);
    }
  };
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>
        Purchase: {purchaseStore.purchaseOverview?.companyName}{" "}
      </h2>
      <form onSubmit={onSubmit} className={styles.form}>
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
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </section>
  );
};

export default Purchase;
