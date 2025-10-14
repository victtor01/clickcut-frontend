import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MemberShip } from '../models/MemberShip';
import { UpdateMemberShipDTO } from '../schemas/update-membership.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MembersService {
  constructor(private readonly apiService: ApiService) {}

  public findAll(): Observable<MemberShip[]> {
    return this.apiService.get(`/members`);
  }

  public update(data: UpdateMemberShipDTO): Observable<{ message: string }> {
    return this.apiService.put('/members', data);
  }
}
