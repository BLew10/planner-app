import React, { useEffect, useState, useRef } from "react";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { AdvertisementPurchaseData } from "./PurchaseDetails";
import { usePurchasesStore } from "@/store/purchaseStore";
import { MONTHS } from "@/lib/constants";
import { motion } from "framer-motion";

// shadcn components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, X, ArrowRight } from "lucide-react";

interface PurchaseDayTypeProps {
  data: AdvertisementPurchaseData | undefined | null;
  closeModal: () => void;
  isOpen: boolean;
  year: string;
}

const PurchaseDayType: React.FC<PurchaseDayTypeProps> = ({
  data,
  closeModal,
  isOpen,
  year,
}) => {
  const purchaseStore = usePurchasesStore();
  const [selectedSlots, setSelectedSlots] = useState<
    { month: number; slot: number }[]
  >([]);
  const { calendarId, adId } = data || {};
  
  // Use a ref to track if we've already initialized from the store
  const initializedRef = useRef(false);
  
  // Calendar constants
  const GRID_CELLS = 42; // 7 columns x 6 rows
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  
  // Calendar generation helper functions
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate grid cells for a month (always 42 cells)
  const getMonthGrid = (month: number, year: number) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDayOfMonth = getFirstDayOfMonth(month, year);
    
    // Create a fixed array of 42 cells
    const grid = Array(GRID_CELLS).fill(null).map((_, index) => {
      const dayNumber = index - firstDayOfMonth + 1;
      
      if (dayNumber > 0 && dayNumber <= daysInMonth) {
        // This is a valid day in the month
        return {
          dayNumber,
          date: new Date(year, month, dayNumber),
          isEmpty: false,
          position: index + 1 // 1-based position
        };
      } else {
        // This is an empty cell
        return {
          dayNumber: null,
          date: null,
          isEmpty: true,
          position: index + 1 // 1-based position
        };
      }
    });
    
    return grid;
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // When modal opens, initialize from the store
      initializedRef.current = false;
      setSelectedSlots([]);
    }
  }, [isOpen]);

  // Load data from store - only once when data is available and we haven't initialized yet
  useEffect(() => {
    if (!isOpen || initializedRef.current || !calendarId || !adId) {
      return;
    }
    
    const storeData = purchaseStore.getByCalendarIdAdId(calendarId, adId);
    if (!storeData) {
      initializedRef.current = true;
      return;
    }
    
    // Reset selectedSlots first to prevent accumulation
    const newSelectedSlots: { month: number; slot: number }[] = [];
    
    // Then add all slots from the store
    for (const slot of storeData.slots || []) {
      // Add all slots regardless of whether they have a date
      newSelectedSlots.push({ month: slot.month, slot: slot.slot });
    }
    
    setSelectedSlots(newSelectedSlots);
    initializedRef.current = true;
  }, [isOpen, calendarId, adId, purchaseStore]);

  const isSlotSelected = (month: number, position: number) => {
    return selectedSlots.some(
      slot => slot.month === month + 1 && slot.slot === position
    );
  };

  const handleSlotSelect = (month: number, position: number) => {
    const isAlreadySelected = selectedSlots.some(
      slot => slot.month === month + 1 && slot.slot === position
    );

    if (isAlreadySelected) {
      // Remove the selected slot
      setSelectedSlots(
        selectedSlots.filter(
          slot => !(slot.month === month + 1 && slot.slot === position)
        )
      );
    } else {
      // Add the new slot
      setSelectedSlots([
        ...selectedSlots,
        {
          month: month + 1, // Store uses 1-based months
          slot: position,
        },
      ]);
    }
  };

  const onSave = () => {
    if (!data) return;

    const { adId, calendarId } = data;
    if (!adId || !calendarId) {
      console.error("Missing adId or calendarId");
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
        slots: selectedSlots.map(slot => ({
          month: slot.month,
          slot: slot.slot,
          date: null, // We're not using dates anymore, just positions
        })),
      },
    };

    purchaseStore.setPurchaseData(newData, calendarId);
    closeModal();
  };

  // Get the numeric year
  const numericYear = parseInt(year);
  const selectedCount = selectedSlots.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="bg-muted/10 p-6 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              Select dates for {data?.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={selectedCount > 0 ? "default" : "outline"} className="font-normal py-1.5">
                {selectedCount} slot{selectedCount !== 1 ? 's' : ''} selected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSlots([])}
                className="h-9 px-3"
              >
                Clear All
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {MONTHS.map((monthName, monthIndex) => (
                <motion.div
                  key={monthIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: monthIndex * 0.03 }}
                >
                  <Card className="overflow-hidden shadow-sm">
                    <CardHeader className="px-4 py-3 bg-muted/5 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{monthName}</CardTitle>
                        <Badge variant="outline" className="text-xs font-normal">
                          {selectedSlots.filter(s => s.month === monthIndex + 1).length} selected
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-2">
                      {/* Calendar header */}
                      <div className="grid grid-cols-7 text-center mb-1">
                        {weekDays.map((day, i) => (
                          <div key={i} className="text-xs font-medium text-muted-foreground p-1">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Calendar grid - always 6 rows x 7 columns = 42 cells */}
                      <div className="grid grid-cols-7 gap-1">
                        {getMonthGrid(monthIndex, numericYear).map((cell, cellIndex) => {
                          const position = cell.position; // 1-42
                          const isSelected = isSlotSelected(monthIndex, position);
                          
                          // Determine grid row for styling
                          const gridRow = Math.floor(cellIndex / 7) + 1;
                          
                          return (
                            <div
                              key={cellIndex}
                              className={`relative aspect-square p-0.5 ${gridRow > 5 ? 'row-6' : ''}`}
                            >
                              <div
                                onClick={() => handleSlotSelect(monthIndex, position)}
                                className={`
                                  w-full h-full rounded-md flex items-center justify-center cursor-pointer
                                  transition-all duration-150 text-xs font-medium
                                  shadow-sm hover:shadow-md
                                  ${isSelected 
                                    ? 'bg-primary/10 border-2 border-primary' 
                                    : 'bg-white dark:bg-gray-800 border border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/20'}
                                  ${cell.isEmpty ? 'opacity-70' : ''}
                                `}
                              >
                                {cell.dayNumber && <span>{cell.dayNumber}</span>}
                                {isSelected && (
                                  <div className="absolute top-1 right-1 rounded-full bg-primary w-2 h-2" />
                                )}
                                <span className="absolute bottom-1 right-1 text-[8px] text-muted-foreground">
                                  {position}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Fixed footer with more prominent Submit button */}
        <div className="p-4 border-t bg-muted/5 sticky bottom-0 left-0 right-0">
          <div className="flex justify-between items-center w-full">
            <Button variant="outline" onClick={closeModal} className="gap-1">
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button 
              onClick={onSave} 
              className="gap-1.5 px-6"
              size="lg"
            >
              Submit <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDayType;
