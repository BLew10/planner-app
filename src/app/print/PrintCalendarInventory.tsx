'use client';
import React from "react";
import { SlotInfo } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import AdvertisementRow from "../dashboard/AdvertisementRow";
import { Card, CardContent } from "@/components/ui/card";

interface PrintCalendarInventoryProps {
    slots: Record<string, SlotInfo[]> | null;
    advertisementTypes: Partial<Advertisement>[] | null;
}

const PrintCalendarInventory: React.FC<PrintCalendarInventoryProps> = ({ slots, advertisementTypes }) => {
    if (!advertisementTypes || advertisementTypes.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6 print:space-y-8">
            {advertisementTypes.map((type) => (
                <Card key={type.id} className="overflow-hidden print:break-inside-avoid">
                    <CardContent className="p-0">
                        <AdvertisementRow
                            slots={type.id && slots ? slots[type.id] : []}
                            adType={type}
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default PrintCalendarInventory; 