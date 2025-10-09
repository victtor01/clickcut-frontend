import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from '../models/Booking';
import { CreateInviteDTO } from '../schemas/create-invite.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InvitesService {
  constructor(private readonly apiService: ApiService) {}

  public createInvite(data: CreateInviteDTO): Observable<Booking[]> {
    return this.apiService.post('/invitations', data);
  }
}
