import { User } from './User';

export interface Business {
  id: string;
  name: string;
  owner?: User;
  timeZoneId?: string;
  revenueGoal?: string;
  isOpen?: boolean;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}