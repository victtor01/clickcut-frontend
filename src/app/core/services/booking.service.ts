import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../DTOs/paginated-result-response';
import { Booking } from '../models/Booking';
import { CreateBookingDTO } from '../schemas/create-booking.dto';
import { SearchBookingByManagerRequest } from '../schemas/search-bookings.dto';
import { UpdateBookingServiceDTO } from '../schemas/update-booking-service.dto';
import { ApiService } from './api.service';

export type BookingsByDay = Record<string, Booking[]>;

@Injectable({ providedIn: 'root' })
export class BookingsService {
  constructor(private readonly apiService: ApiService) {}

  public getAll(startAt?: string, endAt?: string): Observable<BookingsByDay> {
    const startDate = startAt ? dayjs(startAt).startOf('week') : dayjs();
    const endDate = startDate.endOf('week');

    const params = new HttpParams()
      .set('startAt', startDate.format('YYYY-MM-DD'))
      .set('endAt', endDate.format('YYYY-MM-DD'));

    return this.apiService.get('/bookings/all', params);
  }

  public avaibleDays(year: number, month: number, serviceIds: string[]): Observable<string[]> {
    const date = dayjs(new Date(year, month - 1, 1));
    const startAt = date.startOf('month');
    const endAt = date.endOf('month');

    const startAtIso = startAt.utc().toISOString();
    const endAtIso = endAt.utc().toISOString();

    let params = new HttpParams().set('startAt', startAtIso).set('endAt', endAtIso);

    serviceIds.forEach((id) => {
      params = params.append('serviceIds', id);
    });

    return this.apiService.get('/members/available-days', params);
  }

  public cancel(bookingId: string): Observable<{ message: string }> {
    return this.apiService.patch(`/bookings/cancel/${bookingId}`, {});
  }

  public noShow(bookingId: string): Observable<{ message: string }> {
    return this.apiService.patch(`/bookings/no-show/${bookingId}`, {});
  }

  public latests(): Observable<Booking[]> {
    return this.apiService.get('/bookings/latest');
  }

  public search(request: SearchBookingByManagerRequest): Observable<PaginatedResult<Booking>> {
    const params = Object.entries(request).reduce((httpParams, [key, value]) => {
      if (value !== undefined && value !== null) {
        return httpParams.set(key, value.toString());
      }
      return httpParams;
    }, new HttpParams());

    return this.apiService.get('/bookings/search', params);
  }

  public create(createBookingDTO: CreateBookingDTO) {
    return this.apiService.post<Booking>('/bookings', createBookingDTO);
  }

  public updateServices(bookingId: string, services: string[]): Observable<{ message: string }> {
    return this.apiService.patch('/bookings/services', { services, bookingId });
  }

  public updateService(bookingId: string, data: UpdateBookingServiceDTO) {
    return this.apiService.put(`/bookings/services/${bookingId}`, data);
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
