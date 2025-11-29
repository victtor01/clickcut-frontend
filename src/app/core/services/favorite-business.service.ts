import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Business } from '../models/Business';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FavoriteBusinessService {
  constructor(private readonly apiService: ApiService) {}

  public favorite(businessId: string): Observable<void> {
    return this.apiService.post(`/favorites/${businessId}`);
  }

  public unfavorite(businessId: string): Observable<void> {
    return this.apiService.delete(`/favorites/${businessId}`);
  }

  public findAll(): Observable<Business[]> {
    return this.apiService.get(`/favorites`);
  }
}
