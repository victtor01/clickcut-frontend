import { Client } from './Client';
import { Service } from './Service';
import { User } from './User';

export interface Booking {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  services?: Service[]
  client?: Client;
  status: BookingStatus;
  assignedTo: User
}

export type BookingStatus =
  | 'CREATED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAID'
  | 'CANCELLED'
  | 'NO_SHOW';
