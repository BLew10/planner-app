import {
  Contact,
  ContactAddressBook,
  ContactAddress,
  ContactContactInformation,
  ContactTelecomInformation,
  Payment,
  PurchaseOverview,
  AddressBook,
} from "@prisma/client";
export interface ContactModel extends Contact {
  addressBooks: AddressBook[] | null;
  contactAddressBook: ContactAddressBook[]  | null;
  contactAddress: ContactAddress | null;
  contactContactInformation: Partial<ContactContactInformation> | null;
  contactTelecomInformation: ContactTelecomInformation | null;
  payments: Payment[] | null;
  purchases: PurchaseOverview[] | null;
}
