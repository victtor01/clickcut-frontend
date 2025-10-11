import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MemberShip } from '../models/MemberShip';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MembersService {
  constructor(private readonly apiService: ApiService) {}

  public findAll(): Observable<MemberShip[]> {
    return this.apiService.get(`/members`);
  }
}
