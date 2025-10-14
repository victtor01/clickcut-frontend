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
  address: BusinessAddress,
  bannerUrl?: string;
  logoUrl?: string;
  members?: User[];
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}


export interface BusinessAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  complement?: string;
}