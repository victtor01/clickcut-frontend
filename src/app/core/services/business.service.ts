import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { Business, TimeSlot } from '../models/Business';
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

  public avaibleTimes(serviceId: string, date?: string): Observable<string[]> {
    const dateValue = date || dayjs().format('YYYY-MM-DD');

    const params = new HttpParams().set('serviceId', serviceId).set('date', dateValue);

    return this.apiService.get('/bookings/available-times', params);
  }

  public getTimeSlots(): Observable<TimeSlot[]> {
    return this.apiService.get("/business/timeSlot");
  }
}
