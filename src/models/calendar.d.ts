import { User } from '../lib/data/user';
import { Month } from './month';

export interface CalendarEdition {
  id: number;
  userId: number;
  user: User;
  months: Month[];
}

