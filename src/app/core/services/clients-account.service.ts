import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from '../models/Booking';
import { ClientAccount } from '../models/ClientAccount';
import { CreateClientAccountDTO } from '../schemas/create-account.dto';
import { ApiService } from './api.service';

export type BookingsByDay = Record<string, Booking[]>;

@Injectable({ providedIn: 'root' })
export class ClientAccountService {
  constructor(private readonly apiService: ApiService) {}

  public createAccount(data: CreateClientAccountDTO): Observable<ClientAccount> {
    return this.apiService.post('/clients', data);
  }
}
