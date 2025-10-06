import { Service } from './Service';
import { User } from './User';

export interface Business {
  id: string;
  name: string;
  owner?: User;
  timeZoneId?: string;
  revenueGoal?: number;
  isOpen?: boolean;
  services?: Service[];

  bannerUrl?: string;
  logoUrl?: string;
  members?: User[];
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}
