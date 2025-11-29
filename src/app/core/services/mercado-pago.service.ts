import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FinancialSummaryDTO } from '../DTOs/financial-summary-response';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MercadoPagoService {
  constructor(private readonly apiService: ApiService) {}

  public getConnectUrl(): Observable<{ url: string }> {
    return this.apiService.get<{ url: string }>('/mercado-pago/connect/url');
  }

  public getSummary(): Observable<FinancialSummaryDTO> {
    return this.apiService.get("/mercado-pago/summary")
  }

  public getState(): Observable<{ token: string }> {
    return this.apiService.get<{ token: string }>('/mercado-pago/connect/state');
  }

  public disconnect(): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/mercado-pago/disconnect');
  }
}
