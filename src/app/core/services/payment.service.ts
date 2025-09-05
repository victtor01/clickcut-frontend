import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingPayment } from '../models/BookingPayment';
import { CreateManualPaymentDTO } from '../schemas/create-manual-payment.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private readonly apiService: ApiService) {}

  public paymentIntent(bookingId: string): Observable<BookingPayment> {
    return this.apiService.post(`/payments/create-pix-intent/${bookingId}`);
  }

  public findAll(bookingId: string): Observable<BookingPayment[]> {
    return this.apiService.get(`/payments/booking/${bookingId}`);
  }

  public getPendingBalance(bookingId: string): Observable<{ pending: number }> {
    return this.apiService.get(`/payments/outside/${bookingId}`);
  }

  public createManual(data: CreateManualPaymentDTO): Observable<BookingPayment> {
    return this.apiService.post(`/payments/manual`, data);
  }
}
