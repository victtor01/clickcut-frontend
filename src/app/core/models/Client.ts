import { Booking } from './Booking';

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bookings?: Booking[];
	avatarUrl?: string;
}
