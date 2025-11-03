import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TimeSlot } from '../models/Business';
import { MemberShip } from '../models/MemberShip';
import { User } from '../models/User';
import { UpdateMemberShipDTO } from '../schemas/update-membership.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MembersService {
  constructor(private readonly apiService: ApiService) {}

  public findAll(): Observable<MemberShip[]> {
    return this.apiService.get(`/members`);
  }

  public findWithMercadoPago(): Observable<User[]> {
    return this.apiService.get('/members/mercado-pago');
  }

  public findTimesSlots(): Observable<TimeSlot[]> {
    return this.apiService.get("/members/times-slots")
  }

  public update(data: UpdateMemberShipDTO): Observable<{ message: string }> {
    return this.apiService.put('/members', data);
  }
}
