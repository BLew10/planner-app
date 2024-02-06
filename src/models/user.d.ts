export interface User {
    id: number;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    username: string;
    password: string;
    accounts: Account[];
    addressBooks: AddressBook[];
    calendarEditions: CalendarEdition[];
    clients: Client[];
  }
  