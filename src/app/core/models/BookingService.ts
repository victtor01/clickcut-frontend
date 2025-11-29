import { Service } from './Service';

export interface BookingService {
  id: string;
  price: number;
  title: string;
  extraFee: number;
  discount: number;
  finalPrice: number;
  serviceId?: string;
  service?: Service | null;
  notes?: string;
}
