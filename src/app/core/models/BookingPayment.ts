export interface BookingPayment {
  id: string;
  booking: any; // Replace 'any' with the actual Booking type if available
  paymentReferenceId: number;
  status: BookingPaymentStatus;
  qrCodeBase64: string;
  copyPasteCode: string;
  expirationDate: Date;
  bookingPaymentMethod: BookingPaymentMethod;
  bookingPaymentOrigin: BookingPaymentOrigin;
}
export type BookingPaymentMethod = 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';

export type BookingPaymentOrigin = 'GATEWAY' | 'MANUAL';

export type BookingPaymentStatus = 'PENDING' | 'CANCELLED' | 'APPROVED';
