import { Business } from './Business';
import { User } from './User';

export interface Service {
  id: string;
  title: string;
  durationInMinutes: number;
  price: number;
  isActive?: boolean;
  description?: string;
  photoUrl?: string;
  owner?: User;
  business?: Business;
  bookings?: string;
}
