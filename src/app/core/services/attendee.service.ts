import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from '../models/Booking';
import { CreateAppointmentAttendeeDTO } from '../schemas/create-appointment-attendee.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AttendeeService {
  constructor(private readonly apiService: ApiService) {}

  public getBookings(): Observable<Booking[]> {
    return this.apiService.get('/attendee/bookings');
  }

  public createBooking(data: CreateAppointmentAttendeeDTO): Observable<Booking> {
    return this.apiService.post('/attendee/bookings', data);
  }

  /**
   * Busca o histórico de bookings do participante atual.
   * É válido somente para o clientSession.
   *
   * @returns Observable com a lista de bookings.
   */
  public findHistoryForAttendee(): Observable<Booking[]> {
    return this.apiService.get('/attendee/bookings/history');
  }
}
