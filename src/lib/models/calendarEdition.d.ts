import {
    CalendarEdition,
    PurchaseOverview,
  } from "@prisma/client";
  export interface CalendarEditionModel extends CalendarEdition {
    purchases: PurchaseOverview[];
  }
  