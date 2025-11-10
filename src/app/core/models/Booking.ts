import { BookingService } from './BookingService';
import { Business } from './Business';
import { Client } from './Client';
import { User } from './User';

export interface Booking {
  finalPrice: number;
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  services?: BookingService[];
  business?: Business;
  client?: Client;
  commissionAmount: number;
  status: BookingStatus;
  assignedTo?: User;
}


export type BookingStatus =
  | 'CREATED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAID'
  | 'CANCELLED'
  | 'NO_SHOW'
  | "CANCELLED_BY_CLIENT"
  | "CANCELLED_BY_MANAGER"
  | "CANCELLED_LATE_BY_CLIENT"
