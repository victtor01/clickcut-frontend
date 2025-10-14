import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PayrollReviewResponse } from '../DTOs/payroll-review-response';
import { Payout } from '../models/Payout';
import { CreatePayrollDTO } from '../schemas/create-payroll.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  constructor(private readonly apiService: ApiService) {}

  public findAll(): Observable<PayrollReviewResponse[]> {
    return this.apiService.get('/payroll');
  }

  public generate(data: CreatePayrollDTO): Observable<Payout> {
    return this.apiService.post('/payroll/generate', data);
  }
}
