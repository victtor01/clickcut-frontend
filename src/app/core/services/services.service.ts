import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../models/Service';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ServicesService {
  constructor(private readonly apiService: ApiService) {}

  public getAll(): Observable<Service[]> {
    return this.apiService.get('/services');
  }
}
