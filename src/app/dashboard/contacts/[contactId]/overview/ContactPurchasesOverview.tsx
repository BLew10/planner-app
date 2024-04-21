import { useEffect, useState } from "react";
import { getPurchasesByContactId } from "@/lib/data/purchase";
import styles from "./ContactPurchasesOverview.module.scss";
import { Purchase } from "@/lib/data/purchase";
import { MONTHS } from "@/lib/constants";

interface ContactPurchasesOverviewProps {
  contactId: string;
}

interface GroupedPurchases {
  [key: string]: {
    calendarEdition: string; // Assuming calendarEdition is a string; adjust if it's an object or another type
    year: number;
    purchases: {
      id: string;
      advertisement: {
        name: string;
        id: string;
      };
      calendarEdition: string;
      year: number;
      quantity: number;
      charge: number;
      slots: PurchaseSlots[];
    }[];
  };
}

interface PurchaseSlots {
  id: string;
  slot: number | null;
  month: number;
  date: Date | null;
}
const ContactPurchasesOverview = ({
  contactId,
}: ContactPurchasesOverviewProps) => {
  const [groupedPurchases, setGroupedPurchases] =
    useState<GroupedPurchases | null>(null);
  useEffect(() => {
    const fetchContactPurchases = async (contactId: string) => {
      const contactPurchases = await getPurchasesByContactId(contactId);
      if (contactPurchases) {
        const groupedData = groupPurchasesByCalendarAndYear(contactPurchases);
        if (!groupedData || Object.keys(groupedData).length === 0) return;
        setGroupedPurchases(groupedData);
      }
    };
    fetchContactPurchases(contactId);
  }, []);

  const groupPurchasesByCalendarAndYear = (
    purchases: Partial<Purchase>[][] | null
  ) => {
    return (
      purchases?.reduce((acc: { [key: string]: any }, purchaseOverviews) => {
        purchaseOverviews.forEach((purchase) => {
          const { calendarEdition, year } = purchase;
          const key = `${calendarEdition}-${year}`;

          if (!acc[key]) {
            acc[key] = {
              calendarEdition,
              year,
              purchases: [],
            };
          }
          acc[key].purchases.push(purchase);
        });

        return acc;
      }, {} as GroupedPurchases) || {}
    );
  };

  const groupSlotsByMonth = (slots: PurchaseSlots[]) => {
    return slots.reduce((acc, slot) => {
      const { month } = slot;
      const key = `${month}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    }, {} as { [key: string]: PurchaseSlots[] });
  };

  return (
    <div className={styles.contactPurchases}>
      <h2 className={styles.groupHeader}>Purchases</h2>
      {groupedPurchases ? (
        Object.entries(groupedPurchases).map(([key, value]) => (
          <div key={key}>
            <h3
              className={styles.calendarAndYear}
            >{`${value.calendarEdition} - ${value.year}`}</h3>
            <div className={styles.purchases}>
            {value.purchases.map((purchase) => {
              const monthSlots = purchase.slots
                ? groupSlotsByMonth(purchase.slots)
                : null;
              return (
                <div key={purchase.id} className={styles.purchase}>
                  <div className={styles.purchaseHeading}>
                    <p className={styles.adType}>{purchase.advertisement.name}</p>
                    <p className={styles.adCharge}>Total: ${purchase.charge.toFixed(2)}</p>
                  </div>
                  <div key={purchase.id} className={styles.purchaseContent}>
                    {monthSlots && Object.keys(monthSlots).map((month, i) => (
                      <div key={month} className={styles.slot}>
                        <p className={styles.slotMonth}>{MONTHS[i]}:
                        {monthSlots[month].map((slot, i) => (
                          <span key={slot.id} className={styles.slotText}> {slot.date ? slot.date.toString() : `Slot - ${slot.slot}`}{ i < monthSlots[month].length - 1 && ', '}</span>
                        ))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ))
      ) : (
        <p className={styles.noPurchases}>No purchases found</p>
      )}
    </div>
  );
};

export default ContactPurchasesOverview;
