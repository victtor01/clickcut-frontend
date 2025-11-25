import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Invitation } from '../models/Invitation';
import { AcceptInviteDTO } from '../schemas/accept-invite.dto';
import { CreateInviteDTO } from '../schemas/create-invite.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InvitesService {
  constructor(private readonly apiService: ApiService) {}

  public createInvite(data: CreateInviteDTO): Observable<{ message: string }> {
    return this.apiService.post('/invitations', data);
  }

  public getAll(): Observable<Invitation[]> {
    return this.apiService.get('/invitations');
  }

  public accept(data: AcceptInviteDTO): Observable<{ message: string }> {
    return this.apiService.post('/invitations/accept', data);
  }
}
