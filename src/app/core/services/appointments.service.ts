import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from '../models/Booking';
import { Business } from '../models/Business';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { AvaibleTimesDTO } from '../schemas/avaible-times.dto';
import { CreateAppointmentDTO } from '../schemas/create-appointment.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  constructor(private readonly apiService: ApiService) {}

  public getBusinessById(businessId: string): Observable<Business> {
    return this.apiService.get(`/appointments/business/${businessId}`);
  }

  public create(data: CreateAppointmentDTO): Observable<Booking> {
    return this.apiService.post('/appointments', data);
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

  public findBookingById(bookingId: string): Observable<Booking> {
    return this.apiService.get(`/appointments/booking/${bookingId}`);
  }

  public sendCode(bookingId: string): Observable<{ message: string }> {
    return this.apiService.post('/appointments/send-code', {
      bookingId,
    });
  }

  public confirmAppointment(bookingId: string, code: string): Observable<Booking> {
    return this.apiService.post('/appointments/confirm', {
      code,
      bookingId,
    });
  }
}
