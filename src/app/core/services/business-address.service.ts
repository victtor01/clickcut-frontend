import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateBusinessAddressDTO } from '../schemas/update-busienss-address.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BusinessAddressService {
  constructor(private readonly apiService: ApiService) {}

  public update(data: UpdateBusinessAddressDTO): Observable<{ message: string }> {
    return this.apiService.put('/business/address', data);
  }
}
