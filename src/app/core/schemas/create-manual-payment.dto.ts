import { BookingPaymentMethod } from '../models/BookingPayment';

export interface CreateManualPaymentDTO {
  bookingId: string;
  amount: number;
  method: BookingPaymentMethod;
}
