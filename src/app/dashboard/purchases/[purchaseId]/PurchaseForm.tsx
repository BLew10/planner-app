"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Advertisement, CalendarEdition } from "@prisma/client";
import { PurchaseOverviewModel } from "@/lib/models/purchaseOverview";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { getContactById } from "@/lib/data/contact";
import { usePurchasesStore } from "@/store/purchaseStore";
import { usePaymentOverviewStore } from "@/store/paymentOverviewStore";
import { getPurchaseByContactIdAndYear } from "@/lib/data/purchase";
import SelectCalendars from "./SelectCalendars";
import PurchaseDetails from "./PurchaseDetails";
import PurchaseOverview from "./PurchaseOverview";
import { FUTURE_YEARS } from "@/lib/constants";
import { upsertPurchase } from "@/actions/purchases/upsertPurchase";
import PaymentOverview from "./PaymentOverview";
import PaymentDetails from "./PaymentDetails";
import PaymentSchedule from "./PaymentSchedule";
import { toast } from "@/hooks/shadcn/use-toast";

// shadcn components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PurchaseProps {
  advertisementTypes: Partial<Advertisement>[];
  calendars: Partial<CalendarEdition>[];
  purchaseId?: string;
}

interface Contact {
  id: string;
  companyName: string;
}

const defaultYear = FUTURE_YEARS[0].value;

const Purchase: React.FC<PurchaseProps> = ({
  advertisementTypes,
  calendars,
  purchaseId = null,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const purchaseStore = usePurchasesStore();
  const paymentOverviewStore = usePaymentOverviewStore();
  const [year, setYear] = useState<string>(defaultYear);
  const [purchase, setPurchase] =
    useState<Partial<PurchaseOverviewModel> | null>(null);
  const [paymentOverview, setPaymentOverview] =
    useState<Partial<PaymentOverviewModel> | null>(null);
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const goToNextStep = () => setStep((prevStep) => prevStep + 1);
  const goToPreviousStep = () => setStep((prevStep) => prevStep - 1);
  const isInitialMount = React.useRef(true);

  const fetchPurchase = useCallback(
    async (contactId: string, year: string) => {
      if (isFetching) return;

      purchaseStore.reset();
      setPurchase(null);
      setIsFetching(true);
      const purchase = await getPurchaseByContactIdAndYear(contactId, year);
      if (purchase) {
        setPurchase(purchase);
        setPaymentOverview(purchase.paymentOverview || null);
      } else {
        setPaymentOverview(null);
        setPurchase(null);
        purchaseStore.reset();
        paymentOverviewStore.reset();
      }
      setIsFetching(false);
    },
    [isFetching, purchaseStore, paymentOverviewStore]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      const fetchContact = async (contactId: string) => {
        const contactData = await getContactById(contactId);
        if (!contactData) {
          router.push("/dashboard/contacts");
          return;
        }
        if (contactData) {
          const contact = {
            id: contactData.id as string,
            companyName: contactData.contactContactInformation?.company || "",
          };
          setContact(contact);
        }
      };

      const contactId = searchParams?.get("contactId") as string;
      fetchContact(contactId);
      const paramYear = searchParams?.get("year") as string;
      if (paramYear) {
        setYear(paramYear);
      }

      fetchPurchase(contactId, paramYear || defaultYear);
    }

    return () => {
      purchaseStore.reset();
      paymentOverviewStore.reset();
    };
  }, [purchaseId, searchParams]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
    fetchPurchase(contact?.id as string, e.target.value);
  };

  const onSave = async () => {
    setIsFetching(true);
    const { purchaseOverview } = purchaseStore;
    const { paymentOverview } = paymentOverviewStore;
    const success = await upsertPurchase(
      purchaseOverview,
      paymentOverview,
      contact?.id as string,
      year,
      purchaseId as string
    );
    setIsFetching(false);
    if (success) {
      toast({
        title: "Purchase saved successfully",
        description: "Your purchase has been saved and recorded.",
      });
      router.push(`/dashboard?year=${year}`);
    } else {
      toast({
        title: "Failed to save purchase",
        description:
          "Something went wrong. Contact may already have a purchase for this year.",
        variant: "destructive",
      });
    }
  };

  if (isFetching) {
    return (
      <div className="container py-8 space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [
    { id: 1, name: "Select Calendars" },
    { id: 2, name: "Purchase Details" },
    { id: 3, name: "Purchase Overview" },
    { id: 4, name: "Payment Details" },
    { id: 5, name: "Payment Schedule" },
    { id: 6, name: "Payment Overview" },
  ];

  const currentStepDetails = steps.find((s) => s.id === step);

  return (
    <div className="container py-8 space-y-6 w-full max-w-7xl mx-auto">
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Building className="text-muted-foreground h-5 w-5" />
              <CardTitle className="text-2xl">{contact?.companyName}</CardTitle>
              <Badge variant="outline" className="m-0">
                {year}
              </Badge>
            </div>
            <div className="flex space-x-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {step === totalSteps && (
                <Button
                  onClick={onSave}
                  disabled={isFetching}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" /> Save Purchase
                </Button>
              )}
            </div>
          </div>
          <CardDescription className="mt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>
                  Step {step} of {totalSteps}: {currentStepDetails?.name}
                </span>
                <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
              </div>
              <Progress value={(step / totalSteps) * 100} className="h-2" />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <SelectCalendars
              calendars={calendars}
              purchase={purchase}
              onNext={goToNextStep}
              onYearChange={handleYearChange}
              year={year}
            />
          )}
          {step === 2 && (
            <PurchaseDetails
              advertisementTypes={advertisementTypes}
              purchase={purchase}
              onNext={goToNextStep}
              calendars={calendars}
              contactId={contact?.id as string}
              year={year}
            />
          )}
          {step === 3 && (
            <PurchaseOverview
              calendars={calendars}
              advertisementTypes={advertisementTypes}
              onNext={goToNextStep}
            />
          )}
          {step === 4 && (
            <PaymentDetails
              onNext={goToNextStep}
              paymentOverview={paymentOverview}
            />
          )}
          {step === 5 && <PaymentSchedule onNext={goToNextStep} />}
          {step === 6 && <PaymentOverview />}
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchase;
