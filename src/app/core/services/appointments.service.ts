import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Business } from '../models/Business';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { AvaibleTimesDTO } from '../schemas/avaible-times.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  constructor(private readonly apiService: ApiService) {}

  public getBusinessById(businessId: string): Observable<Business> {
    return this.apiService.get(`/appointments/business/${businessId}`);
  }

  public findAssigner(userId: string): Observable<User> {
    return this.apiService.get(`/users/assigners/${userId}`);
  }

  public findServices(businessId: string): Observable<Service[]> {
    return this.apiService.get(`/appointments/${businessId}/services`);
  }

  public availableTimes(avaibleTimes: AvaibleTimesDTO): Observable<string[]> {
    return this.apiService.post('/appointments/available-times', avaibleTimes);
  }
}
