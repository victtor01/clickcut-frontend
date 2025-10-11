import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../models/Role';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RolesService {
  constructor(private readonly apiService: ApiService) {}

  public findAll(): Observable<Role[]> {
    return this.apiService.get(`/roles`);
  }
}
