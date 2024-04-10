
import { AddressBook, Contact, ContactAddressBook } from "@prisma/client"
export interface AddressBookModel extends AddressBook {
    contacts : Contact[]
    contactAddressBook: ContactAddressBook
}
