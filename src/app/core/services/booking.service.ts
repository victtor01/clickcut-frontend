import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { Booking } from '../models/Booking';
import { CreateBookingDTO } from '../schemas/create-booking.dto';
import { ApiService } from './api.service';

export type BookingsByDay = Record<string, Booking[]>;

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private readonly apiService: ApiService) {}

  public getAll(startAt?: string, endAt?: string): Observable<BookingsByDay> {
    const startDate = startAt ? dayjs(startAt).startOf('week') : dayjs();
    const endDate = startDate.endOf('week');

    const params = new HttpParams()
      .set('startAt', startDate.format('YYYY-MM-DD'))
      .set('endAt', endDate.format('YYYY-MM-DD'));

    return this.apiService.get('/bookings/all', params);
  }

  public create(createBookingDTO: CreateBookingDTO) {
    return this.apiService.post<Booking>('/bookings', createBookingDTO);
  }

  public findById(bookingId: string): Observable<Booking> {
    return this.apiService.get<Booking>(`/bookings/${bookingId}`);
  }

  public start(bookingId: string): Observable<Booking> {
    return this.apiService.patch(`/bookings/start/${bookingId}`);
  }

  public finish(bookingId: string): Observable<Booking> {
    return this.apiService.patch(`/bookings/finish/${bookingId}`);
  }
}
