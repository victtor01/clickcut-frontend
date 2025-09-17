import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingHistory as BookingHistoryDTO } from '../DTOs/booking-history-response';
import { GeneralHistoryDTO } from '../DTOs/general-history-response';
import { RevenueHistoryDTO } from '../DTOs/revenue-history-response';
import { Booking } from '../models/Booking';
import { ApiService } from './api.service';

export type BookingsByDay = Record<string, Booking[]>;

@Injectable({ providedIn: 'root' })
export class SummaryService {
  constructor(private readonly apiService: ApiService) {}

  public getBookingHistory(): Observable<BookingHistoryDTO> {
    return this.apiService.get('/summary/bookings/history');
  }

  public getRevenue(): Observable<RevenueHistoryDTO> {
    return this.apiService.get('/summary/revenue');
  }

  public getGeneral(): Observable<GeneralHistoryDTO> {
    return this.apiService.get('/summary/general');
  }
}
