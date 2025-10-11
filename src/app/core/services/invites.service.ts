import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AcceptInviteDTO } from '../schemas/accept-invite.dto';
import { CreateInviteDTO } from '../schemas/create-invite.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InvitesService {
  constructor(private readonly apiService: ApiService) {}

  public createInvite(data: CreateInviteDTO): Observable<{ message: string }> {
    return this.apiService.post('/invitations', data);
  }

  public accept(data: AcceptInviteDTO): Observable<{ message: string }> {
    return this.apiService.post('/invitations/accept', data);
  }
}
