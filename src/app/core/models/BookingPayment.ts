export interface BookingPayment {
  id: string;
  booking: any; 
  amount: number;
  status: BookingPaymentStatus;
  paymentMethod: BookingPaymentMethod;
  paymentOrigin: BookingPaymentOrigin;
  
  qrCodeBase64?: string;
  copyPasteCode?: string;
  expirationDate?: Date;
  paymentReferenceId?: number;
}

export type BookingPaymentMethod = 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';

export type BookingPaymentOrigin = 'GATEWAY' | 'MANUAL';

export type BookingPaymentStatus = 'PENDING' | 'CANCELLED' | 'APPROVED';
