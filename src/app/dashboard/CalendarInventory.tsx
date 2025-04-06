'use client';
import React from "react";
import { SlotInfo } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import AdvertisementRow from "./AdvertisementRow";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CalendarInventoryProps {
    slots: Record<string, SlotInfo[]> | null;
    advertisementTypes: Partial<Advertisement>[] | null;
}

const CalendarInventory: React.FC<CalendarInventoryProps> = ({ slots, advertisementTypes }) => {
    if (!advertisementTypes || advertisementTypes.length === 0) {
        return (
            <Alert variant="default" className="bg-muted/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Please select at least one advertisement type to view inventory.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {advertisementTypes.map((type) => (
                <Card key={type.id || ''} className="overflow-hidden">
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

export default CalendarInventory;
