import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Business } from '../models/Business';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  constructor(private readonly apiService: ApiService) {}

	public getAll(): Observable<Business[]> {
		return this.apiService.get<Business[]>("/business/all");
	}
}
