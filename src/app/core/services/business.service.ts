import { Injectable } from '@angular/core';
import { objectToFormData } from '@app/shared/utils/object-to-form';
import dayjs from 'dayjs';
import { BehaviorSubject, filter, first, Observable, tap } from 'rxjs';
import { BusinessSetupItem } from '../DTOs/business-setup-state.response';
import { ClientsSummaryResponse } from '../DTOs/clients-summary-response';
import { Business, TimeSlot } from '../models/Business';
import { BusinessStatement } from '../models/BusinessStatement';
import { CreateBusinessDTO } from '../schemas/create-business.dto';
import { CreateTimeSlotDTO } from '../schemas/create-time-slot.dto';
import { UpdateBusinessDTO } from '../schemas/update-business.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private businessSession$$ = new BehaviorSubject<Business | null>(null);
  public businessSession$ = this.businessSession$$.asObservable();

  constructor(private readonly apiService: ApiService) {}

  public loadBusinessSession(): Observable<Business> {
    if (this.businessSession$$.getValue()) {
      return this.businessSession$.pipe(
        filter((business): business is Business => business !== null), // Garante que não é nulo
        first(),
      );
    }

    return this.getBusinessSession().pipe(
      tap((business) => {
        this.businessSession$$.next(business);
      }),
    );
  }

  public getBusinessSetupState(): Observable<BusinessSetupItem[]> {
    return this.apiService.get('/business/setup-state');
  }

  public delete(): Observable<any> {
    return this.apiService.delete('/business');
  }

  public updatePassword(newPassword: string): Observable<{ message: string }> {
    return this.apiService.put('/business/password', { newPassword });
  }

  public removePin(): Observable<void> {
    return this.apiService.delete('/business/password');
  }

  public getAll(): Observable<Business[]> {
    return this.apiService.get<Business[]>('/business/all');
  }

  public avaibleHandle(handle: string): Observable<boolean> {
    return this.apiService.get(`/business/avaible-handle/${handle}`);
  }

  public create(createBusinessDTO: CreateBusinessDTO): Observable<Business> {
    return this.apiService.post<Business>('/business', createBusinessDTO);
  }

  public select(businessId: string, password?: string): Observable<boolean> {
    return this.apiService.post('/auth/business', {
      businessId,
      ...(password && { password }),
    });
  }

  public openOrClose(isOpen: boolean): Observable<{ status: boolean }> {
    return this.apiService.put('/business/status', { isOpen });
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

  public getClients(): Observable<ClientsSummaryResponse> {
    return this.apiService.get('/business/clients');
  }
}
