'use client';
import React from "react";
import { SlotInfo } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import AdvertisementRow from "./AdvertisementRow";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

    // Use the first ad type as the default tab
    const defaultValue = advertisementTypes[0].id || '';

    return (
        <Tabs defaultValue={defaultValue} className="w-full">
            <TabsList className="mb-4 h-auto flex-wrap gap-2">
                {advertisementTypes.map((type) => (
                    <TabsTrigger
                        key={type.id}
                        value={type.id || ''}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        {type.name}
                    </TabsTrigger>
                ))}
            </TabsList>
            {advertisementTypes.map((type) => (
                <TabsContent key={type.id} value={type.id || ''}>
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <AdvertisementRow
                                slots={type.id && slots ? slots[type.id] : []}
                                adType={type}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            ))}
        </Tabs>
    );
}

export default CalendarInventory;
