import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PayrollReviewResponse } from '../DTOs/payroll-review-response';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  constructor(private readonly apiService: ApiService) {}

  public findAll(): Observable<PayrollReviewResponse[]> {
    return this.apiService.get('/payroll');
  }
}
