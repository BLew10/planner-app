import React, { useEffect, useState, Fragment } from "react";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import Calendar, { TileArgs } from "react-calendar";
import styles from "./PurchaseDayType.module.scss";
import "react-calendar/dist/Calendar.css";
import { AdvertisementPurchaseData } from "./PurchaseDetails";
import { usePurchasesStore } from "@/store/purchaseStore";
import { Dialog, Transition } from "@headlessui/react";
import { MONTHS } from "@/lib/constants";

interface PurchaseDayTypeProps {
  data: AdvertisementPurchaseData | undefined | null;
  closeModal: () => void;
  isOpen: boolean;
  year: string;
}

const PurchaseDayType: React.FC<PurchaseDayTypeProps> = ({
  data,
  closeModal,
  isOpen,
  year,
}) => {
  const purchaseStore = usePurchasesStore();
  const [selectedDays, setSelectedDays] = useState<
    { date?: Date; month: number; slot: number }[]
  >([]);
  let currMonthIndex = -1;
  let slotIndex = 0;
  const { calendarId, adId } = data || {};
  const storeData = purchaseStore.getByCalendarIdAdId(
    calendarId as string,
    adId as string
  );
  useEffect(() => {
    if (storeData) {
      for (const slot of storeData.slots || []) {
        if (slot.date) {
          const date = new Date(slot.date || "");
          setSelectedDays((prev) => [
            ...prev,
            { date, month: slot.month, slot: slot.slot },
          ]);
        } else {
          setSelectedDays((prev) => [
            ...prev,
            { month: slot.month, slot: slot.slot },
          ]);
        }
      }
    }
  }, [purchaseStore, data]);

  const handleDaySelect = (date: Date, month: number) => {
    const isSelected = selectedDays.some(
      (s) => s.date?.getTime() === date.getTime() && s.date.getMonth() === month
    );
    if (isSelected) {
      setSelectedDays(
        selectedDays.filter(
          (s) =>
            s.date?.getTime() !== date.getTime() || s.date?.getMonth() !== month
        )
      );
    } else {
      setSelectedDays([...selectedDays, { date, month, slot: slotIndex }]);
    }
  };

  const tileClassName = (
    { date, view }: { date: Date; view: string },
    month: number
  ) => {
    if (view === "month") {
      const isSelected = selectedDays.some(
        (s) =>
          s.date?.getDate() === date.getDate() &&
          s.date?.getMonth() === date.getMonth() &&
          s.date?.getFullYear() === date.getFullYear() &&
          month === date.getMonth()
      );
      return isSelected ? styles.selectedDay : "";
    }
  };


  // on isSelected and value in dev env, do slotIndex / 2
  const tileContent = (
    { date, view, }: { date: Date; view: string },
    month: number
  ) => {
    if (view === "month") {
      if (month !== currMonthIndex) {
        currMonthIndex = month;
        slotIndex = 0;
      }
      slotIndex++;
      let isSelected = selectedDays.some(
        (s) => s.date?.getTime() === date.getTime() && month === date.getMonth()
      );
      const value = date.getMonth() === month ? date.toLocaleDateString() : "";
      if (!isSelected) {
        isSelected =
          storeData?.slots?.some(
            (s) => s.slot === slotIndex && s.month === month + 1
          ) || false;
      }

      return (
        <input
          type="checkbox"
          name={`adid-${data?.adId}-month-${month + 1}`}
          value={value || slotIndex}
          defaultChecked={isSelected}
          className={styles.checkbox}
        />
      );
    }
    return null;
  };

  const onSave = () => {
    if (!data) return;

    const { adId, calendarId } = data; // Assuming these are provided
    if (!adId || !calendarId) {
      console.error("Missing adId or calendarId");
      return;
    }
    let selected = [];
    for (let month = 0; month < 12; month++) {
      const checkboxes = document.getElementsByName(
        `adid-${adId}-month-${month + 1}`
      ) as NodeListOf<HTMLInputElement>;

      const selectedDates = Array.from(checkboxes)
        .map((checkbox, index) => ({
          month: month + 1,
          slot: index + 1,
          checked: checkbox.checked,
          date: Number.isNaN(Number(checkbox.value))
            ? formatDateToString(new Date(checkbox.value))
            : null,
        }))
        .filter((date) => date.checked);
      selected.push(...selectedDates);
    }
    let newData = {
      [adId]: {
        perMonth:
          purchaseStore.purchaseOverview?.[calendarId]?.[adId]?.perMonth || "",
        quantity:
          purchaseStore.purchaseOverview?.[calendarId]?.[adId]?.quantity || "",
        charge:
          purchaseStore.purchaseOverview?.[calendarId]?.[adId]?.charge || "",
        slots: selected,
      },
    };

    purchaseStore.setPurchaseData(newData, calendarId);
    closeModal();
  };
  const getFirstDayOfMonth = (monthIndex: number) => {
    const date = new Date();
    date.setMonth(monthIndex);
    date.setFullYear(Number(year));
    date.setDate(1);
    return date;
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
                    </Dialog.Title>

                    <div className={styles.months}>
                      {MONTHS.map((month, index) => (
                        <div key={index} className={styles.container}>
                          <h3 className={styles.monthName}>{month}</h3>
                          <Calendar
                            onClickDay={(date) => handleDaySelect(date, index)}
                            tileClassName={(props) =>
                              tileClassName(props, index)
                            }
                            activeStartDate={getFirstDayOfMonth(index)}
                            tileContent={(props: TileArgs) => tileContent(props, index)}
                            calendarType="gregory"
                            view="month"
                            showNavigation={false}
                            showFixedNumberOfWeeks={true}
                            formatShortWeekday={(locale, date) =>
                              ["S", "M", "T", "W", "T", "F", "S"][date.getDay()]
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

export default PurchaseDayType;
