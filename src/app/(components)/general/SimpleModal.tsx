import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import styles from "./SimpleModal.module.scss";

interface SimpleModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onAction?: () => void;
  title?: string;
  text?: string | React.ReactNode;
  actionText?: string;
}

export default function SimpleModal({
  isOpen,
  closeModal,
  onAction,
  title,
  text,
  actionText = "Confirm",
}: SimpleModalProps) {
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
                <div className="mt-2">
                  <p className={`${styles.text}`}>{text}</p>
                </div>

                <div className="mt-4 flex justify-between">
                  {onAction && (
                    <button
                      onClick={onAction}
                      type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        {actionText}
                      </button>
                  )}
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
