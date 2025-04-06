"use client";

import React, { useEffect, useState } from "react";
import { Advertisement, CalendarEdition } from "@prisma/client";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import { usePurchasesStore } from "@/store/purchaseStore";
import { motion } from "framer-motion";
import PurchaseNonDayType from "./PurchaseNonDayType";
import PurchaseDayType from "./PurchaseDayType";
import { useToast } from "@/hooks/shadcn/use-toast";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight, MapPin, AlertCircle, Check } from "lucide-react";

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

const PurchaseDetails: React.FC<PurchaseProps> = ({
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

  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

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
              slot: slot.slot ?? 0,
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
    // Clear the error state when user makes changes
    if (formErrors[`${adId}-${calendarId}`]) {
      setFormErrors((prev) => ({ ...prev, [`${adId}-${calendarId}`]: false }));
    }

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
    const newErrors: { [key: string]: boolean } = {};
    let hasErrors = false;

    for (const calendarId in purchaseData) {
      const calendarData = purchaseData[calendarId];
      for (const adId in calendarData) {
        const adType = advertisementTypes.find((ad) => ad.id === adId);
        const adData = calendarData[adId];
        let { slots, quantity, charge } = adData;

        if (!adType?.perMonth || adType?.perMonth === 0) {
          // Extra Cases is the ad type and am using quantity as the slot number
          adData.slots = [
            {
              slot: Number(quantity),
              month: -1,
              date: null,
            },
          ];
          slots = adData.slots;
        }

        if (
          (quantity !== "" || charge !== "") &&
          (!slots || slots.length === 0)
        ) {
          const errorKey = `${adId}-${calendarId}`;
          newErrors[errorKey] = true;
          hasErrors = true;

          const calendar = calendars.find(
            (calendar) => calendar.id === calendarId
          );
          const ad = advertisementTypes.find((ad) => ad.id === adId);

          toast({
            title: "Missing placement information",
            description: `Please select at least one slot in the calendar ${calendar?.name} for the advertisement ${ad?.name}.`,
            variant: "destructive",
          });
        }
      }
    }

    setFormErrors(newErrors);

    if (!hasErrors) {
      purchaseStore.updateTotal();
      onNext();
    }
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={onContinue} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] bg-muted/50 sticky left-0 z-10">
                      Advertisement Type
                    </TableHead>
                    {selectedCalendars.map((calendar) => (
                      <TableHead 
                        key={calendar.id} 
                        className="min-w-[300px] border-l-2 border-l-muted"
                      >
                        <div className="font-medium text-primary">
                          {calendar.name}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertisementTypes
                    ?.filter((at) => at.id !== undefined)
                    .map((ad, index) => (
                      <TableRow 
                        key={ad.id} 
                        className={`${
                          index % 2 === 0 
                            ? "bg-white" 
                            : "bg-slate-400/10"
                        }`}
                        noHoverState={true}
                      >
                        <TableCell className="font-medium sticky left-0 z-10">
                          {ad.name}
                        </TableCell>
                        {selectedCalendars?.map((calendar) => {
                          const data = purchaseStore.getByCalendarIdAdId(
                            calendar.id!,
                            ad.id!
                          );
                          const hasError =
                            formErrors[`${ad.id}-${calendar.id}`];

                          const needsPlacement =
                            ad.perMonth !== 0 &&
                            (data.quantity !== "" || data.charge !== "") &&
                            (!data.slots || data.slots.length === 0);

                          return (
                            <TableCell
                              key={`${ad.id}-${calendar.id}`}
                              className={`relative border-l-2 border-l-muted ${
                                hasError ? "bg-destructive/10" : ""
                              }`}
                              id={`${ad.id}-${calendar.id}`}
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`quantity-${ad.id}-${calendar.id}`}
                                  >
                                    Quantity
                                  </Label>
                                  <Input
                                    id={`quantity-${ad.id}-${calendar.id}`}
                                    type="number"
                                    value={data.quantity}
                                    onChange={(e) =>
                                      handleInputChange(
                                        calendar.id as string,
                                        ad.id as string,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    className={`w-24 ${
                                      hasError ? "border-destructive" : ""
                                    }`}
                                    min="0"
                                    placeholder="0"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`charge-${ad.id}-${calendar.id}`}
                                  >
                                    Charge
                                  </Label>
                                  <Input
                                    id={`charge-${ad.id}-${calendar.id}`}
                                    type="text"
                                    pattern="[0-9.]*"
                                    value={data.charge}
                                    onChange={(e) =>
                                      handleInputChange(
                                        calendar.id as string,
                                        ad.id as string,
                                        "charge",
                                        e.target.value
                                      )
                                    }
                                    className={`w-24 ${
                                      hasError ? "border-destructive" : ""
                                    }`}
                                    placeholder="$0.00"
                                  />
                                </div>

                                {ad.perMonth !== 0 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant={
                                            data.slots?.length 
                                              ? "add" 
                                              : needsPlacement 
                                                ? "destructive" 
                                                : "outline"
                                          }
                                          size="sm"
                                          className={`mt-2 md:mt-0 min-w-[90px] ${
                                            needsPlacement ? "animate-pulse" : ""
                                          }`}
                                          onClick={() => {
                                            if (ad.isDayType) {
                                              openDayTypeModal(
                                                ad,
                                                calendar.id as string
                                              );
                                            } else {
                                              openNonDayTypeModal(
                                                ad,
                                                calendar.id as string
                                              );
                                            }
                                          }}
                                        >
                                          {data.slots?.length ? (
                                            <>
                                              <Check className="h-4 w-4 mr-1" />
                                              {data.slots.length} Placed
                                            </>
                                          ) : (
                                            <>
                                              {needsPlacement ? "Required" : "Place"}
                                            </>
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {needsPlacement
                                          ? "Placement required before continuing"
                                          : data.slots?.length
                                          ? `${data.slots.length} slots placed`
                                          : "Place advertisement position"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}

                                {hasError && (
                                  <div className="absolute -top-2 -right-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="p-1 bg-destructive text-destructive-foreground rounded-full">
                                            <AlertCircle className="h-4 w-4" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Please select at least one slot
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" className="flex items-center gap-1">
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

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
      </form>
    </motion.div>
  );
};

export default PurchaseDetails;
