import { Contact } from '../lib/data/contact';
import { User } from '../lib/data/user';

export interface AddressBook {
  id: string;
  name: string;
  displayLevel?: string | null;
  userId: string;
  user: User;
  contacts: Contact[];
}
