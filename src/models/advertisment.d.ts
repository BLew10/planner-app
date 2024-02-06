import { Contact } from "../lib/data/contact";

export interface Advertisement {
  id: string;
  type: string;
  isDayType: boolean;
  monthId: number;
  contactId?: string | null;
  contact?: Contact | null;
  month: Month;
}
