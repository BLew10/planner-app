import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import styles from "./PaymentScheduleModal.module.scss";
import { getPaymentOverviewById } from "@/lib/data/paymentOverview";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";

interface PaymentScheduleModalProps {
  isOpen: boolean;
  closeModal: () => void;
  title?: string;
  paymentId: string;
}

export default function PaymentScheduleModal({
  isOpen,
  closeModal,
  title,
  paymentId,
}: PaymentScheduleModalProps) {
  const [paymentOverview, setPaymentOverviewData] =
    useState<Partial<PaymentOverviewModel> | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      const data = await getPaymentOverviewById(paymentId);
      setPaymentOverviewData(data || null);
      setIsFetching(false);
    };
    fetchData();
  }, [paymentId]);
  
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
                        <p className="font-bold">Payment Schedule</p>
                    {paymentOverview?.scheduledPayments &&
                    paymentOverview?.scheduledPayments.length > 0 ? (
                      <>
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th scope="col" className="px-6 py-3">
                                Due Date
                              </th>
                              <th scope="col" className="px-6 py-3">
                                Amount Owed
                              </th>
                              <th scope="col" className="px-6 py-3">
                                Payment Date
                              </th>
                              <th scope="col" className="px-6 py-3">
                                Amount Paid
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentOverview.scheduledPayments?.map(
                              (payment) => (
                                <tr
                                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                  key={payment.id}
                                >
                                  <td className="px-6 py-4">
                                    {payment.dueDate}
                                  </td>
                                  <td className="px-6 py-4">
                                    ${Number(payment.amount).toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4">
                                    {payment.paymentDate}
                                  </td>
                                  <td className="px-6 py-4">
                                    ${Number(payment.amountPaid).toFixed(2)}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <div className="text-center">
                        No Payment Schedule found
                      </div>
                    )}
                    <div className="mt-10">
                    <p className="font-bold">Payment History</p>

                      {paymentOverview?.payments &&
                      paymentOverview?.payments.length > 0 ? (
                        <>
                          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                              <tr>
                                <th scope="col" className="px-6 py-3">
                                  Payment Date
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  Payment Method
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  Check Number
                                </th>

                                <th scope="col" className="px-6 py-3">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paymentOverview.payments?.map((payment) => (
                                <tr
                                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                  key={payment.id}
                                >
                                  <td className="px-6 py-4">
                                    {payment.paymentDate}
                                  </td>
                                  <td className="px-6 py-4">
                                    {payment.paymentMethod}
                                  </td>
                                  <td className="px-6 py-4">
                                    {payment.checkNumber}
                                  </td>

                                  <td className="px-6 py-4">
                                    ${Number(payment.amount).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      ) : (
                        <div className="text-center">
                          No Payments have been made
                        </div>
                      )}
                    </div>
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
