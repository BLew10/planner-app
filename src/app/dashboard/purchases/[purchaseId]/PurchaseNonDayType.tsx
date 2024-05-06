"use client";

import React, { Fragment, useEffect, useState } from "react";
import { usePurchasesStore } from "@/store/purchaseStore";
import styles from "./PurchaseNonDayType.module.scss";
import CheckboxGroup from "@/app/(components)/form/CheckboxGroup";
import { AdvertisementPurchaseData } from "./PurchaseDetails";
import { Dialog, Transition } from "@headlessui/react";
import { MONTHS } from "@/lib/constants";
import { getTakenSlots } from "@/lib/data/purchase";

interface PurchaseNonDayTypeProps {
  data: AdvertisementPurchaseData | undefined | null;
  closeModal: () => void;
  isOpen: boolean;
  year: string;
  contactId: string
}

const PurchaseNonDayType = ({
  data,
  closeModal,
  isOpen,
  year,
  contactId
}: PurchaseNonDayTypeProps) => {
  const [options, setOptions] = useState<
    Array<{ label: string | React.ReactNode ; value: string; checked: boolean, disabled: boolean }[]>
  >(MONTHS.map(() => []));
  const purchaseStore = usePurchasesStore();

  useEffect(() => {
    if (
      !data ||
      !purchaseStore.purchaseOverview ||
      !data.calendarId ||
      !data.adId
    ) {
      // Set default unchecked state if no data is available
      setOptions(
        MONTHS.map((_, monthIndex) =>
          Array.from({ length: Number(data?.perMonth) || 0 }, (_, i) => ({
            label: `${i + 1}`,
            value: `${i + 1}`,
            checked: false,
            disabled: false,
          }))
        )
      );
      return;
    }

    // Retrieve existing slot data from the store
    const storeData =
      purchaseStore.purchaseOverview[data.calendarId]?.[data.adId];

    // Set checkbox states based on existing store data
    setOptions(
      MONTHS.map((_, monthIndex) =>
        Array.from({ length: Number(data.perMonth) || 0 }, (_, i) => ({
          label: `${i + 1}`,
          value: `${i + 1}`,
          checked:
            storeData?.slots?.some(
              (slot) => slot.slot === i + 1 && slot.month === monthIndex + 1
            ) || false,
          disabled: false,
        }))
      )
    );
  }, [data, purchaseStore.purchaseOverview]);

  useEffect(() => {
    const fetchTakenSlots = async () => {
      if (!data) return;
      const { adId, calendarId } = data; // Assuming these are provided
      if (!adId || !calendarId) {
        return;
      }
      const takenSlots = await getTakenSlots(year, calendarId, contactId);
      if (!takenSlots) return;
      setOptions((prevOptions) =>
        prevOptions.map((monthOpts, monthIndex) => {
          return monthOpts.map((opt, slotIndex) => {
            const alreadyTaken = takenSlots.find(
              (slot) =>
                slot.month === monthIndex + 1 && slot.slot === Number(opt.value)
            ) ;
            return {
              ...opt,
              label: alreadyTaken ? <div className={styles.taken}><span>{slotIndex + 1} - </span> <span className={styles.company}>{alreadyTaken?.contact?.contactContactInformation?.company}</span></div>: opt.label,
              checked: !!alreadyTaken || opt.checked,
              disabled: !!alreadyTaken,
            };
          });
        })
      );
    };

    fetchTakenSlots();
  }, [year, contactId, data]);

  const handleCheckboxChange = (
    monthIndex: number,
    slotIndex: string,
    isChecked: boolean
  ) => {
    setOptions((prevOptions) =>
      prevOptions.map((monthOpts, idx) => {
        if (idx === monthIndex) {
          return monthOpts.map((opt) => ({
            ...opt,
            checked: opt.label === slotIndex ? isChecked : opt.checked,
          }));
        }
        return monthOpts;
      })
    );
  };

  const onSave = async () => {
    if (!data) return;

    const { adId, calendarId } = data; // Assuming these are provided
    if (!adId || !calendarId) {
      console.error("Missing adId or calendarId");
      return;
    }

    const slotsByMonth = options
      .map((monthOpts, monthIndex) => ({
        month: monthIndex + 1,
        slots: monthOpts
          .filter((opt) => opt.checked && !opt.disabled)
          .map((opt) => ({
            slot: Number(opt.value),
            date: null,
          })),
      }))
      .filter((month) => month.slots.length > 0);

    if (slotsByMonth.length === 0) {
      purchaseStore.setPurchaseData(
        {
          [adId]: {
            quantity:
              purchaseStore.purchaseOverview?.[calendarId]?.[adId]?.quantity ||
              "",
            charge:
              purchaseStore.purchaseOverview?.[calendarId]?.[adId]?.charge ||
              "",
          },
        },
        calendarId
      );
      closeModal();
      return;
    }

    const newData = {
      [adId]: {
        quantity:
          purchaseStore.purchaseOverview?.[calendarId]?.[adId]?.quantity || "",
        charge:
          purchaseStore.purchaseOverview?.[calendarId]?.[adId]?.charge || "",
        slots: slotsByMonth.flatMap((month) =>
          month.slots.map((slot) => ({
            slot: slot.slot,
            month: month.month,
            date: slot.date,
          }))
        ),
      },
    };

    purchaseStore.setPurchaseData(newData, calendarId);
    closeModal();
  };

  const uncheckAll = () => {
    setOptions((prevOptions) =>
      prevOptions.map((monthOpts) =>
        monthOpts.map((opt) => ({ ...opt, checked: false }))
      )
    );
  };

  return (
    <div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel
                    className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${styles.modal}`}
                  >
                    <Dialog.Title
                      as="h3"
                      className={`text-lg font-medium leading-6 text-gray-900 ${styles.title}`}
                    >
                      <span>Select slots for {data?.name}</span>{" "}
                      <button
                        type="button"
                        onClick={uncheckAll}
                        className={styles.clear}
                      >
                        Clear
                      </button>
                    </Dialog.Title>

                    <div className={styles.months}>
                      {MONTHS.map((month, index) => (
                        <div key={index}>
                          <h4 className={styles.text}>{month}</h4>
                          <CheckboxGroup
                            name={`month-${index}`}
                            options={options[index]}
                            useGrid={false}
                            onChange={(e) =>
                              handleCheckboxChange(
                                index,
                                e.target.value,
                                e.target.checked
                              )
                            }
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={onSave}
                      >
                        Save
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </>
        </Dialog>
      </Transition>
    </div>
  );
};

export default PurchaseNonDayType;
