import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification } from '../models/Notification';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  constructor(private readonly apiService: ApiService) {}

  public getNotifications(): Observable<Notification[]> {
    return this.apiService.get('/notifications');
  }

  public markAsRead(): Observable<{ message: string }> {
    return this.apiService.post("/notifications/mark-as-read");
  }
}
