"use client";

import React, { Fragment, useEffect, useState } from "react";
import { usePurchasesStore } from "@/store/purchaseStore";
import { AdvertisementPurchaseData } from "./PurchaseDetails";
import { Dialog, Transition } from "@headlessui/react";
import { MONTHS } from "@/lib/constants";
import { getTakenSlots } from "@/lib/data/purchase";
import { motion } from "framer-motion";

// shadcn components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarDays, Check, Save, X } from "lucide-react";

interface PurchaseNonDayTypeProps {
  data: AdvertisementPurchaseData | undefined | null;
  closeModal: () => void;
  isOpen: boolean;
  year: string;
  contactId: string;
}

const PurchaseNonDayType = ({
  data,
  closeModal,
  isOpen,
  year,
  contactId,
}: PurchaseNonDayTypeProps) => {
  const [options, setOptions] = useState<
    Array<
      {
        label: string | React.ReactNode;
        value: string;
        checked: boolean;
        disabled: boolean;
        takenBy?: string;
      }[]
    >
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
      const { adId, calendarId } = data;
      if (!adId || !calendarId) {
        return;
      }
      const takenSlots = await getTakenSlots(year, calendarId, contactId, adId);
      if (!takenSlots) return;
      setOptions((prevOptions) =>
        prevOptions.map((monthOpts, monthIndex) => {
          return monthOpts.map((opt, slotIndex) => {
            const alreadyTaken = takenSlots.find(
              (slot) =>
                slot.month === monthIndex + 1 && slot.slot === Number(opt.value)
            );

            const companyName =
              alreadyTaken?.contact?.contactContactInformation?.company || "";

            return {
              ...opt,
              label: `${slotIndex + 1}`,
              checked: !!alreadyTaken || opt.checked,
              disabled: !!alreadyTaken,
              takenBy: alreadyTaken ? companyName : undefined,
            };
          });
        })
      );
    };

    fetchTakenSlots();
  }, [year, contactId, data]);

  const handleCheckboxChange = (
    monthIndex: number,
    slotIndex: number,
    isChecked: boolean
  ) => {
    setOptions((prevOptions) =>
      prevOptions.map((monthOpts, idx) => {
        if (idx === monthIndex) {
          return monthOpts.map((opt, i) => ({
            ...opt,
            checked: i === slotIndex ? isChecked : opt.checked,
          }));
        }
        return monthOpts;
      })
    );
  };

  const onSave = async () => {
    if (!data) return;

    const { adId, calendarId } = data;
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
            perMonth:
              purchaseStore.purchaseOverview?.[calendarId]?.[adId]?.perMonth ||
              "",
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
        perMonth:
          purchaseStore.purchaseOverview?.[calendarId]?.[adId]?.perMonth || "",
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
        monthOpts.map((opt) => ({ ...opt, checked: opt.disabled }))
      )
    );
  };

  // Calculate selected slots count
  const selectedCount = options.reduce((total, monthOpts) => {
    return (
      total + monthOpts.filter((opt) => opt.checked && !opt.disabled).length
    );
  }, 0);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/10 pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        Select slots for {data?.name}
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={selectedCount > 0 ? "default" : "outline"}
                          className="font-normal py-1.5"
                        >
                          {selectedCount} slot{selectedCount !== 1 ? "s" : ""}{" "}
                          selected
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={uncheckAll}
                          className="h-9 px-3"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-250px)] max-h-[600px]">
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {MONTHS.map((month, monthIndex) => (
                            <motion.div
                              key={monthIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: monthIndex * 0.03 }}
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium flex items-center text-base">
                                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {month}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="font-normal text-xs"
                                  >
                                    {
                                      options[monthIndex].filter(
                                        (opt) => opt.checked && !opt.disabled
                                      ).length
                                    }{" "}
                                    selected
                                  </Badge>
                                </div>
                                <Separator />

                                <div className="grid grid-cols-4 gap-2">
                                  {options[monthIndex].map(
                                    (option, slotIndex) => {
                                      const isAvailable = !option.disabled;
                                      const isSelected =
                                        option.checked && !option.disabled;
                                      const isTaken = option.disabled;

                                      return (
                                        <div
                                          key={`${monthIndex}-${slotIndex}`}
                                          className={`
                                          relative aspect-square
                                          ${isTaken ? "group" : ""}
                                        `}
                                        >
                                          {isTaken && option.takenBy ? (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div
                                                    className={`
                                                    h-full w-full border rounded-md overflow-hidden flex flex-col
                                                    bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30
                                                    transition-all duration-150
                                                  `}
                                                  >
                                                    <div className="px-2 py-3 flex flex-col h-full">
                                                      <div className="flex justify-between items-start">
                                                        <span className="font-medium">
                                                          {slotIndex + 1}
                                                        </span>
                                                        <div className="rounded-full p-1 bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-100">
                                                          <Check className="h-2.5 w-2.5" />
                                                        </div>
                                                      </div>

                                                      <div className="mt-1 text-[10px] leading-tight text-muted-foreground truncate font-medium">
                                                        {option.takenBy}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="p-2 max-w-[200px]">
                                                  <p className="text-sm">
                                                    Taken by: {option.takenBy}
                                                  </p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          ) : (
                                            <div
                                              className={`
                                              h-full w-full border rounded-md overflow-hidden flex flex-col
                                              ${
                                                isTaken
                                                  ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30"
                                                  : isSelected
                                                  ? "bg-primary/10 border-primary"
                                                  : "bg-card hover:bg-muted/10 border-muted-foreground/20"
                                              }
                                              ${isTaken ? "" : "cursor-pointer"}
                                              transition-all duration-150
                                            `}
                                              onClick={() => {
                                                if (!isTaken) {
                                                  handleCheckboxChange(
                                                    monthIndex,
                                                    slotIndex,
                                                    !option.checked
                                                  );
                                                }
                                              }}
                                            >
                                              <div className="px-2 py-3 flex flex-col h-full">
                                                <div className="flex justify-between items-start">
                                                  <span className="font-medium">
                                                    {slotIndex + 1}
                                                  </span>
                                                  {(isSelected || isTaken) && (
                                                    <div
                                                      className={`
                                                    rounded-full p-1
                                                    ${
                                                      isTaken
                                                        ? "bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-100"
                                                        : "bg-primary text-primary-foreground"
                                                    }
                                                  `}
                                                    >
                                                      <Check className="h-2.5 w-2.5" />
                                                    </div>
                                                  )}
                                                </div>

                                                {option.takenBy && (
                                                  <div className="mt-1 text-[10px] leading-tight text-muted-foreground line-clamp-2 font-medium">
                                                    {option.takenBy}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          {/* Hidden checkbox for accessibility */}
                                          <Checkbox
                                            checked={option.checked}
                                            disabled={option.disabled}
                                            onCheckedChange={(checked) => {
                                              if (!option.disabled) {
                                                handleCheckboxChange(
                                                  monthIndex,
                                                  slotIndex,
                                                  !!checked
                                                );
                                              }
                                            }}
                                            className="sr-only"
                                          />
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>

                  <CardFooter className="flex justify-between bg-muted/10 py-4 border-t">
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                    <Button onClick={onSave} className="gap-1">
                      <Save className="h-4 w-4" /> Save Selections
                    </Button>
                  </CardFooter>
                </Card>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PurchaseNonDayType;
