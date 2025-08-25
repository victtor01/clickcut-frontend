import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Business } from '../models/Business';
import { BusinessStatement } from '../models/BusinessStatement';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  constructor(private readonly apiService: ApiService) {}

  public getAll(): Observable<Business[]> {
    return this.apiService.get<Business[]>('/business/all');
  }

  public select(businessId: string): Observable<boolean> {
    return this.apiService.post('/auth/business', {
      businessId,
    });
  }

  public getStatement(): Observable<BusinessStatement> {
    return this.apiService.get<BusinessStatement>('/business/statement');
  }
}
