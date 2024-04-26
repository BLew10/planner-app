import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import styles from "./PurcahseDetailsModal.module.scss";
import { getAllSlotsFromPurchase } from "@/lib/data/purchase";
import { CalendarSlots } from "@/lib/data/purchase";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";
import { MONTHS } from "@/lib/constants";

interface PurchaseDetailsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  title?: string;
  purchaseId: string;
}

export default function PurchaseDetailsModal({
  isOpen,
  closeModal,
  title,
  purchaseId,
}: PurchaseDetailsModalProps) {
  const [data, setData] = useState<Record<string, CalendarSlots> | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      const data = await getAllSlotsFromPurchase(purchaseId);
      setData(data || null);
      setIsFetching(false);
    };
    fetchData();
  }, [purchaseId]);
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
                {title && (
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 text-gray-900 ${styles.title}`}
                  >
                    {title}
                  </Dialog.Title>
                )}
                {isFetching ? (
                  <LoadingSpinner className={styles.spinner} />
                ) : (
                  <div className="mt-2">
                    {data &&
                      Object.entries(data).map(([calendarId, calendar]) => (
                        <div key={calendarId}>
                          <h4 className={styles.calendarName}>
                            {calendar.name}
                          </h4>
                          <div className={styles.adsContainer}>
                          {Object.entries(calendar.ads).map(([adId, ad]) => (
                            <div key={adId} >
                              <h5 className={styles.adName}>{ad.name}</h5>
                              {ad.slots.map((slot) => (
                                <p key={slot.id} className={styles.slotDetails}>
                                  {MONTHS[slot.month -1]} - Slot: {slot.slot}{" "}
                                  {slot.date ? `Date: ${slot.date}` : ""}
                                </p>
                              ))}
                            </div>
                          ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

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
