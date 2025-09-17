import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingHistory } from '../DTOs/booking-history-response';
import { Booking } from '../models/Booking';
import { ApiService } from './api.service';

export type BookingsByDay = Record<string, Booking[]>;

@Injectable({ providedIn: 'root' })
export class SummaryService {
  constructor(private readonly apiService: ApiService) {}

  public getBookingHistory(): Observable<BookingHistory> {
    return this.apiService.get('/summary/bookings/history');
  }
}
