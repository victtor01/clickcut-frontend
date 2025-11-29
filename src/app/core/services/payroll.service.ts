import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PayrollReviewResponse } from '../DTOs/payroll-review-response';
import { Booking } from '../models/Booking';
import { Payout } from '../models/Payout';
import { CreatePayrollDTO } from '../schemas/create-payroll.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  constructor(private readonly apiService: ApiService) {}

  public findAll(): Observable<PayrollReviewResponse[]> {
    return this.apiService.get('/payroll');
  }

  public pay(payoutId: string, file?: File | null): Observable<{ message: string }> {
    const form = new FormData();

    form.append('payoutId', payoutId);

    if (file) {
      form.append('file', file);
    }

    return this.apiService.patchForm('/payroll/mark-as-paid', form);
  }

  public findById(id: string): Observable<Payout> {
    return this.apiService.get(`/payroll/${id}`);
  }

  public getBookings(payoutId: string): Observable<Booking[]> {
    return this.apiService.get(`/payroll/${payoutId}/bookings`);
  }

  public generate(data: CreatePayrollDTO): Observable<Payout> {
    return this.apiService.post('/payroll/generate', data);
  }
}
