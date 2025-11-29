import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

interface BusinessCard {
  id: string; // Guid
  name: string; // string
  averageRating: number; // double
  totalReviews: number; // int
  logoUrl?: string | null; // string?
  description?: string | null; // string?
}

export interface ExplorePage {
  newBusinesses: BusinessCard[];
  topRatedBusinesses: BusinessCard[];
  nearYouBusinesses: BusinessCard[];
}

@Injectable({ providedIn: 'root' })
export class ExploreService {
  constructor(private readonly apiService: ApiService) {}

  public findAll(cep: string): Observable<ExplorePage> {
    return this.apiService.get(`/explore?cep=${cep}`);
  }
}
