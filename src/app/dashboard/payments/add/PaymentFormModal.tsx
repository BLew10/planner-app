import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import styles from "./PaymentFormModal.module.scss";
import { UpsertPaymentData } from "@/actions/payments/upsertPayment";

interface PaymentFormModalProps {
  isOpen: boolean;
  closeModal: () => void;
  submit: () => void;
  paymentData: UpsertPaymentData | null;
  companyName: string
}

export default function PaymentFormModal({
  isOpen,
  closeModal,
  submit,
  paymentData,
  companyName
}: PaymentFormModalProps) {

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
                 Payment Details
                </Dialog.Title>
                <div className="mt-2">
                 <div className={styles.details}>
                  <p className={styles.label}>Contact: <span>{companyName}</span></p>
                  <p className={styles.label}>Amount Owed: <span>${paymentData?.totalOwed.toFixed(2)}</span></p>
                  <p className={styles.label}>Start Date: <span>{paymentData?.startDate.toISOString().split("T")[0]}</span></p>
                  <p className={styles.label}>Anticipated End Date: <span>{paymentData?.anticipatedEndDate.toISOString().split("T")[0]}</span></p>
                  <p className={styles.label}>Frequency: <span>{paymentData?.frequency}</span></p>
                  <p className={styles.label}>Total Payments: <span>{paymentData?.totalPayments}</span></p>
                 </div>
                </div>

                <div className={`mt-4 ${styles.actions}`}>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={submit}
                  >
                    {paymentData?.paymentId ? "Update Payment" : "Add Payment"}
                  </button>
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
