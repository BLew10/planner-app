import { User } from "@prisma/client";

export interface Contact {
  id: string;
  userId: string;
  notes: string?;
  customerSince: string?;
  webAddress: string?;
  user: User;
  contactAddress: ContactAddress;
  category: ContactCategory;
  contactInfo: ContactContactInformation;
  telecomInfo: ContactTelecomInformation;
  user: User;
  displays: Display[];
  addressBooks: AddressBook[];
}

export interface ContactCategory {
  id: string;
  name: string;
  contacts: Contact[];
}

export interface ContactContactInformation {
  id: string;
  contactId: number;
  firstName?: string | null;
  lastName?: string | null;
  altContactFirstName?: string | null;
  altContactLastName?: string | null;
  salutation?: string | null;
  company?: string | null;
  contact?: Contact | null;
}

export interface ContactTelecomInformation {
  id: string;
  contactId: number;
  extension?: string | null;
  phone?: string | null;
  altPhone?: string | null;
  fax?: string | null;
  email?: string | null;
  cellPhone?: string | null;
  homePhone?: string | null;
  contact?: Contact | null;
}

export interface ContactAddress {
  id: string;
  contactId: number;
  address?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  contact?: Contact | null;
}
