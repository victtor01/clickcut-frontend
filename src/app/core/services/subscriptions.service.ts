import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../models/Service';
import { CreateSubscriptionDTO } from '../schemas/create-subscription.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  constructor(private readonly apiService: ApiService) {}

  public create(data: CreateSubscriptionDTO): Observable<Service> {
    return this.apiService.post('/subscriptions', data);
  }
}
