import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { getPurchasesByMonthCalendarIdAndYear } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import { PurchaseSlot } from "@/lib/data/purchase";
import { MONTHS } from "@/lib/constants";
import styles from "./MonthlyPurchasesModal.module.scss";

interface MonthlyPurchasesModalProps {
  isOpen: boolean;
  advertisements: Partial<Advertisement>[] | null;
  closeModal: () => void;
  monthIndex: number;
  calendarId: string;
  year: string;
}

export default function MonthlyPurchasesModal({
  isOpen,
  closeModal,
  monthIndex,
  calendarId,
  year,
  advertisements,
}: MonthlyPurchasesModalProps) {
  const [groupedPurchases, setGroupedPurchases] = useState<
    Record<string, PurchaseSlot[]>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      const purchases = await getPurchasesByMonthCalendarIdAndYear(
        monthIndex+1,
        calendarId,
        year
      );
      if (purchases) {
        const grouped = purchases.reduce((acc, purchase) => {
          // Ensure the accumulator has an array to push into for each advertisementId
          if (!acc[purchase.advertisementId || ""]) {
            acc[purchase.advertisementId || ""] = [];
          }
          acc[purchase.advertisementId || ""].push(purchase);
          return acc;
        }, {} as Record<string, PurchaseSlot[]>);

        setGroupedPurchases(grouped);
      }
    };

    fetchData();
  }, [monthIndex, calendarId, year]);

  const renderPurchases = () => {
    console.log(groupedPurchases);
    return Object.entries(groupedPurchases).map(([adId, purchases]) => {
      const ad = advertisements?.find((ad) => ad.id === adId);
      return (
        <div key={adId}>
          <h4 className={styles.adName}>{ad?.name}</h4>
          {purchases.map((purchase) => (
            <div key={purchase.id} className={styles.purchase}>
              {ad?.isDayType && purchase.date
                ? `${
                    purchase.companyName
                  } - ${purchase.date.toLocaleDateString()}`
                : `${purchase.companyName} - Slot: ${purchase.slot}`}
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                  Purchases for {MONTHS[monthIndex]} {year}
                </Dialog.Title>
                <div className="mt-2">
                  {groupedPurchases && Object.keys(groupedPurchases).length > 0
                    ? renderPurchases()
                    : "No purchases found"}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
