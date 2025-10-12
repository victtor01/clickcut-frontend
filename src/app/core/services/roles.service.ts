import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleLegendDTO } from '../DTOs/roles-legends-response';
import { Role } from '../models/Role';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RolesService {
  constructor(private readonly apiService: ApiService) {}

  public findAll(): Observable<Role[]> {
    return this.apiService.get(`/roles`);
  }

  public findLegends(): Observable<RoleLegendDTO[]> {
    return this.apiService.get('/roles/legends');
  }

  public findById(id: string): Observable<Role> {
    return this.apiService.get(`/roles/${id}`);
  }

  public update(role: Role): Observable<Role> {
    return this.apiService.put('/roles', role);
  }
}
