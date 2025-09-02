import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingPayment } from '../models/BookingPayment';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private readonly apiService: ApiService) {}
  
	public paymentIntent(bookingId: string): Observable<BookingPayment> {
		return this.apiService.post(`/payments/create-pix-intent/${bookingId}`);
	}
}
