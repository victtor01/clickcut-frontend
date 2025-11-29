import { Injectable } from '@angular/core';
import { objectToFormData } from '@app/shared/utils/object-to-form';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { CreateManagerAccountDTO } from '../schemas/create-manager-account.dto';
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

  public forgotPassword(email: string): Observable<{ message: string }> {
    return this.apiService.post('/forgot-password', { email });
  }

  public createAccount(data: CreateManagerAccountDTO): Observable<User> {
    return this.apiService.post('/users', data);
  }

  public resetPassword(token: string, pass: string, confirmPass: string): Observable<{}> {
    return this.apiService.post('/forgot-password/reset', {
      token: token,
      confirmPassword: confirmPass,
      newPassword: pass,
    });
  }
}
