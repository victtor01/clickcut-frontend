import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ServerService {
  constructor(private readonly apiService: ApiService) {}

	public getTimeZones(): Observable<string[]> {
		return this.apiService.get("/timezones");
	}
}
