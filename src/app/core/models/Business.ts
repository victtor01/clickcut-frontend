import { Service } from './Service';
import { User } from './User';

export interface Business {
  id: string;
  name: string;
  owner?: User;
  ownerId?: string;
  timeZoneId?: string;
  revenueGoal?: number;
  isOpen?: boolean;
  services?: Service[];
  address: BusinessAddress,
  bannerUrl?: string;
  logoUrl?: string;
  members?: User[];
  paymentReceiverId?: string;
  paymentReceiver?: User;
  hasPassword?: boolean | number;
  profile?: BusinessProfile,
}

export interface TimeSlot {
  dayOfWeek: string | number;
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

export interface BusinessProfile {
  name: string;
  handle?: string;
  phoneNumber?: string;
  description?: string;
  bannerUrl?: string;
  logoUrl?: string;
}