import { Injectable } from '@angular/core';
import { objectToFormData } from '@app/shared/utils/object-to-form';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { Business, TimeSlot } from '../models/Business';
import { BusinessStatement } from '../models/BusinessStatement';
import { CreateBusinessDTO } from '../schemas/create-business.dto';
import { CreateTimeSlotDTO } from '../schemas/create-time-slot.dto';
import { UpdateBusinessDTO } from '../schemas/update-business.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  constructor(private readonly apiService: ApiService) {}

  public getAll(): Observable<Business[]> {
    return this.apiService.get<Business[]>('/business/all');
  }

  public create(createBusinessDTO: CreateBusinessDTO): Observable<Business> {
    return this.apiService.post<Business>('/business', createBusinessDTO);
  }

  public select(businessId: string): Observable<boolean> {
    return this.apiService.post('/auth/business', {
      businessId,
    });
  }

  public createTimeSlot(timeSlot: CreateTimeSlotDTO): Observable<TimeSlot> {
    return this.apiService.put('/business/timeSlot', timeSlot);
  }

  public getStatement(): Observable<BusinessStatement> {
    return this.apiService.get<BusinessStatement>('/business/statement');
  }

  public avaibleTimes(serviceIds: string[], date?: string): Observable<string[]> {
    const dateValue = date || dayjs().format('YYYY-MM-DD');

    const params = {
      serviceIds: serviceIds,
      date: dateValue,
    };

    return this.apiService.post('/bookings/available-times', params);
  }

  public update(updateDTO: UpdateBusinessDTO): Observable<Business> {
    const form = objectToFormData(updateDTO);
    return this.apiService.putForm('/business', form);
  }

  public getBusinessSession(): Observable<Business> {
    return this.apiService.get('/business/session');
  }

  public getTimeSlots(): Observable<TimeSlot[]> {
    return this.apiService.get('/business/timeSlot');
  }
}
