import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentMethod } from '../models/PaymentMethod';
import { CreatePaymentMethodDTO } from '../schemas/create-payment-method.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  constructor(private readonly apiService: ApiService) {}

  public create(data: CreatePaymentMethodDTO): Observable<PaymentMethod> {
    return this.apiService.post('/payment-methods', data);
  }

  public findAll(): Observable<PaymentMethod[]> {
    return this.apiService.get('/payment-methods');
  }
}
