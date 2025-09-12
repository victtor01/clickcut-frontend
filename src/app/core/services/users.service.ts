import { Injectable } from '@angular/core';
import { objectToFormData } from '@app/shared/utils/object-to-form';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { UpdateUserDTO } from '../schemas/update-user.dto';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly apiService: ApiService) {}

  public findSummary(): Observable<User> {
    return this.apiService.get('/users/summary');
  }

  public sendEmailToChangeEmail(email: string) {
    return this.apiService.post('/users/change-email/code', { email });
  }

  public update(data: UpdateUserDTO): Observable<User> {
    const form = objectToFormData(data);
    return this.apiService.putForm('/users', form);
  }
}
