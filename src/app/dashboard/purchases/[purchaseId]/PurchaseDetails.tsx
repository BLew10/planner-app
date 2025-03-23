"use client";

import React, { useEffect, useState } from "react";
import { Advertisement } from "@prisma/client";
import TextInput from "@/app/(components)/form/TextInput";
import PurchaseNonDayType from "./PurchaseNonDayType";
import PurchaseDayType from "./PurchaseDayType";
import styles from "./PurchaseDetails.module.scss";
import { usePurchasesStore } from "@/store/purchaseStore";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import { CalendarEdition } from "@prisma/client";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { useToast } from "@/hooks/shadcn/use-toast";
interface PurchaseProps {
  advertisementTypes: Partial<Advertisement>[];
  calendars: Partial<CalendarEdition>[];
  purchase?: Partial<PurchaseOverviewModel> | null;
  onNext: () => void;
  year: string;
  contactId: string;
}

export interface AdvertisementPurchaseData {
  name?: string;
  quantity: string;
  adId?: string;
  perMonth?: number;
  calendarId?: string;
  charge: string;
  slots?: { slot: number; month: number | null; date: string | null }[];
}

const Purchase: React.FC<PurchaseProps> = ({
  advertisementTypes,
  purchase = null,
  calendars,
  onNext,
  year,
  contactId,
}) => {
  const purchaseStore = usePurchasesStore();
  const { toast } = useToast();
  const [selectedCalendars, setSelectedCalendars] = useState<
    Partial<CalendarEdition>[]
  >([]);
  const [activeModalData, setActiveModalData] = useState<{
    data?: AdvertisementPurchaseData;
    isOpenDayType: boolean;
    isOpenNonDayType: boolean;
  }>({ isOpenDayType: false, isOpenNonDayType: false });

  useEffect(() => {
    if (purchase) {
      const sessionCalendars = Object.keys(
        purchaseStore?.purchaseOverview || {}
      );
      const calendarIds = purchase.calendarEditions
        ?.filter((calendar) => sessionCalendars.includes(calendar.id))
        .map((calendar) => calendar.id);
      for (const calendarId of calendarIds || []) {
        let data: { [key: string]: any } = {};
        const advertisementIds = purchase.adPurchases
          ?.filter((ad) => ad.calendarId === calendarId)
          .map((ad) => ad.advertisementId);
        for (const adId of advertisementIds || []) {
          if (typeof adId !== "string") continue;
          const slots = purchase?.adPurchaseSlots
            ?.filter(
              (slot) =>
                slot.calendarId === calendarId &&
                slot.advertisementPurchase?.advertisementId === adId
            )
            .map((slot) => ({
              slot: slot.slot ?? 0, // Using 0 as a default, adjust as necessary
              month: slot.month ?? 0,
              date: slot.date || null,
            }));
          const adData = purchase?.adPurchases?.find(
            (ad) => ad.advertisementId === adId && ad.calendarId === calendarId
          );
          const perMonth = adData?.advertisement?.perMonth;
          const quantity = adData?.quantity;
          const charge = adData?.charge;

          data[adId] = {
            perMonth: perMonth?.toString() || "",
            quantity: quantity?.toString() || "",
            charge: charge?.toString() || "",
            slots,
          };
        }

        purchaseStore.setPurchaseData(data, calendarId);
      }
    }
  }, [purchase]);

  useEffect(() => {
    const filteredCalendars = calendars?.filter(
      (calendar) => calendar.id && purchaseStore.purchaseOverview?.[calendar.id]
    );
    setSelectedCalendars(filteredCalendars || []);
  }, [purchaseStore.purchaseOverview, calendars]);

  const handleInputChange = (
    calendarId: string,
    adId: string,
    field: "quantity" | "charge",
    value: string
  ) => {
    if (field === "quantity") {
      purchaseStore.setQuantity(calendarId, adId, value);
    } else if (field === "charge") {
      purchaseStore.setCharge(calendarId, adId, value);
    }
  };

  // Handle form submission
  const onContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const purchaseData = purchaseStore.purchaseOverview;
    for (const calendarId in purchaseData) {
      const calendarData = purchaseData[calendarId];
      for (const adId in calendarData) {
        const adType = advertisementTypes.find((ad) => ad.id === adId);
        const adData = calendarData[adId];
        // If perMonth is 0, we don't need to check for slots (Extra Cases is the ad type)
        let { slots, quantity, charge } = adData;

        if (!adType?.perMonth == null || adType?.perMonth === undefined || adType?.perMonth === 0) {
          // Extra Cases is the ad type and am using quantity as the slot number to set the quantity to easily implement it on Dashboard
          adData.slots = [
            {
              slot: Number(quantity),
              month: -1,
              date: null,
            },
          ];
          slots = adData.slots;
        }
        
        if ((quantity !== "" || charge !== "") && (!slots || slots.length === 0)) {
          const ad = advertisementTypes.find((ad) => ad.id === adId);
          const calendar = calendars.find(
            (calendar) => calendar.id === calendarId
          );
          const errorAd = document.getElementById(`${adId}-${calendarId}`);
          const placeErrorButton = document.getElementById(
            `button-${adId}-${calendarId}`
          );
          errorAd?.scrollIntoView({ behavior: "smooth", block: "center" });
          placeErrorButton?.classList.add(styles.pulse);
          toast({
            title: `Please select at least one slot in the calendar ${calendar?.name} for the advertisement ${ad?.name}.`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    purchaseStore.updateTotal();
    onNext();
  };

  const openDayTypeModal = (
    adType: Partial<Advertisement>,
    calendarId: string
  ) => {
    const data = purchaseStore.getByCalendarIdAdId(calendarId, adType.id!);
    setActiveModalData({
      isOpenDayType: true,
      isOpenNonDayType: false,
      data: {
        ...data,
        perMonth: adType?.perMonth,
        name: adType?.name,
        adId: adType.id,
        calendarId: calendarId,
      },
    });
  };

  const openNonDayTypeModal = (
    adType: Partial<Advertisement>,
    calendarId: string
  ) => {
    const data = purchaseStore.getByCalendarIdAdId(calendarId, adType.id!);
    setActiveModalData({
      isOpenDayType: false,
      isOpenNonDayType: true,
      data: {
        ...data,
        perMonth: adType?.perMonth,
        name: adType?.name,
        adId: adType.id,
        calendarId: calendarId,
      },
    });
  };

  return (
    <AnimateWrapper>
      <form onSubmit={onContinue} className={styles.form}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <div className={styles.empty}></div>
            {selectedCalendars?.map((calendar) => (
              <div key={calendar.id}>
                <h3 className={styles.calendarName}>{calendar.name}</h3>
                {selectedCalendars.length > 1 && (
                  <button
                    className={styles.deleteCalendar}
                    onClick={(e) => {
                      e.preventDefault();
                      if (calendar.id) {
                        purchaseStore.removeCalendarId(calendar.id);
                      }
                    }}
                  >
                    Delete Calendar
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className={styles.body} key={purchase?.id}>
            {advertisementTypes
              ?.filter((at) => at.id != undefined)
              .map((ad) => {
                return (
                  <div key={ad.id}>
                    <div key={`${ad.id}`} className={styles.advertisementType}>
                      <h3 className={styles.advertisementName}>{ad.name}</h3>
                      {selectedCalendars?.map((calendar) => {
                        const data = purchaseStore.getByCalendarIdAdId(
                          calendar.id!,
                          ad.id!
                        );
                        return (
                          <div
                            key={`${ad.id}-${calendar.id}`}
                            className={styles.inputGroup}
                            id={`${ad.id}-${calendar.id}`}
                          >
                            <TextInput
                              label="Quantity"
                              name={`quantity-${ad.id}`}
                              type="number"
                              pattern="[0-9]*"
                              placeholder="Quantity"
                              min="0"
                              isRequired={(data.perMonth != null || data.perMonth != undefined) && (data.slots && data.slots.length > 0)}
                              value={data.quantity}
                              onChange={(e) =>
                                handleInputChange(
                                  calendar.id as string,
                                  ad.id as string,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />
                            <TextInput
                              label="Charge"
                              name={`charge-${ad.id}`}
                              type="text"
                              pattern="[0-9.]*"
                              min="0"
                              isRequired={(data.perMonth != null || data.perMonth != undefined) && (data.slots && data.slots.length > 0)}
                              placeholder="Charge"
                              value={data.charge}
                              onChange={(e) =>
                                handleInputChange(
                                  calendar.id as string,
                                  ad.id as string,
                                  "charge",
                                  e.target.value
                                )
                              }
                            />
                            {ad.perMonth !== 0 && (
                              <button
                                type="button"
                                className={styles.placeButton}
                                id={`button-${ad.id}-${calendar.id}`}
                                onClick={(e) => {
                                  e.currentTarget.classList.remove(
                                    styles.pulse
                                  );
                                  if (ad.isDayType) {
                                    openDayTypeModal(ad, calendar.id as string);
                                  } else {
                                    openNonDayTypeModal(
                                      ad,
                                      calendar.id as string
                                    );
                                  }
                                }}
                              >
                                Place
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className={styles.divider}></div>
                  </div>
                );
              })}
          </div>
        </div>
        {activeModalData.isOpenNonDayType && (
          <PurchaseNonDayType
            data={activeModalData.data}
            year={year}
            contactId={contactId}
            closeModal={() =>
              setActiveModalData({
                isOpenDayType: false,
                isOpenNonDayType: false,
              })
            }
            isOpen={activeModalData.isOpenNonDayType}
          />
        )}

        {activeModalData.isOpenDayType && (
          <PurchaseDayType
            data={activeModalData.data}
            year={year}
            closeModal={() =>
              setActiveModalData({
                isOpenDayType: false,
                isOpenNonDayType: false,
              })
            }
            isOpen={activeModalData.isOpenDayType}
          />
        )}
        <button type="submit" className={styles.submitButton}>
          {purchase?.id ? "Update" : "Create"}
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default Purchase;
