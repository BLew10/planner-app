import React, { Suspense } from "react";
import PurchaseForm from "./PurchaseForm";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const PurchaseOverviewPage = async ({
  params,
}: {
  params: { purchaseId: string };
}) => {
  const { purchaseId } = params;

  const advertisementTypes = await getAllAdvertisementTypes();
  const { data: calendars } = await getAllCalendars();

  if (
    !advertisementTypes ||
    !advertisementTypes.data ||
    advertisementTypes.data.length === 0
  ) {
    redirect("/dashboard/advertisement-types");
  }

  if (!calendars || calendars.length === 0) {
    redirect("/dashboard/calendars");
  }

  return (
    <Suspense fallback={<PurchaseFormSkeleton />}>
      <div className="container py-6 space-y-6">
        <PurchaseForm
          advertisementTypes={advertisementTypes.data}
          purchaseId={purchaseId}
          calendars={calendars}
        />
      </div>
    </Suspense>
  );
};

// Skeleton loader using shadcn components
function PurchaseFormSkeleton() {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}

export default PurchaseOverviewPage;
