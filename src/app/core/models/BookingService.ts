import { Service } from './Service';

export interface BookingService {
  id: string;
  price: number;
  title: string;
  extraFee: number;
  discount: number;
  finalPrice: number;
  service?: Service | null;
  notes?: string;
}
