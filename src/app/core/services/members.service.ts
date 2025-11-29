import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dayjs } from 'dayjs';
import { Observable } from 'rxjs';
import { MemberPerformanceResponse } from '../DTOs/members-performace-response';
import { TimeSlot } from '../models/Business';
import { MemberShip } from '../models/MemberShip';
import { User } from '../models/User';
import { CreateTimeSlotDTO } from '../schemas/create-time-slot.dto';
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


  public getPerformace(start: Dayjs, end: Dayjs): Observable<MemberPerformanceResponse[]> {
    const params = new HttpParams()
      .set("start", start.toISOString())
      .set("end", end.toISOString())
    
    return this.apiService.get("/members/performance", params);
  }

  public createTimeSlots(data: CreateTimeSlotDTO[]): Observable<TimeSlot[]> {
    return this.apiService.post('/members/times-slots', { times: data });
  }

  public findTimesSlots(): Observable<TimeSlot[]> {
    return this.apiService.get('/members/times-slots');
  }

  public update(data: UpdateMemberShipDTO): Observable<{ message: string }> {
    return this.apiService.put('/members', data);
  }
}
