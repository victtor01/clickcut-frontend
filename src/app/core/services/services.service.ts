import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../models/Service';
import { CreateServiceDTO } from '../schemas/create-service.dto';
import { UpdateServiceDTO } from '../schemas/update-service.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ServicesService {
  constructor(private readonly apiService: ApiService) {}

  public getAll(): Observable<Service[]> {
    return this.apiService.get('/services');
  }

  public findById(serviceId: string): Observable<Service> {
    return this.apiService.get(`/services/${serviceId}`);
  }

  public update(serviceId: string, updateServiceDTO: UpdateServiceDTO): Observable<Service> {
    return this.apiService.put(`/services/${serviceId}`, updateServiceDTO);
  }

  public create(createServiceDTO: CreateServiceDTO): Observable<Service> {
    return this.apiService.post('/services', createServiceDTO);
  }
}
