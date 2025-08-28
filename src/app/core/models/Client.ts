import { Booking } from './Booking';

export interface Client {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  bookings: Booking[];
	avatarUrl?: string;
}
