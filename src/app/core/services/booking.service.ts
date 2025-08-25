import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { Booking } from '../models/Booking';
import { ApiService } from './api.service';

export type BookingsByDay = Record<string, Booking[]>;

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private readonly apiService: ApiService) {}

  public getAll(startAt?: string, endAt?: string): Observable<BookingsByDay> {
    const startDate = startAt ?? dayjs().format('YYYY-MM-DD');

    const endDate = endAt ?? startDate;

    const params = new HttpParams()
      .set('startAt', startDate)
      .set('endAt', endDate);

    return this.apiService.get('/bookings/all', params);
  }
}
