import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { User } from '../models/User';
import { ApiService } from './api.service';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated: boolean = false;
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly apiService: ApiService) {}

  public checkAuthStatus(): Observable<boolean> {
    return this.apiService.get<User>(`/users/mine`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      }),
      map(() => true),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(false);
      })
    );
  }

  public login(email: string, password: string): Observable<AuthResponse> {
    const res = this.apiService
      .post<AuthResponse>('/auth', {
        email,
        password,
      })
      .pipe(
        tap(() => {
          this.checkAuthStatus().subscribe();
        })
      );
    return res;
  }

  public getCurrentUserSnapshot(): User | null {
    return this.currentUserSubject?.value;
  }

  public isLogged(): boolean {
    return this.isAuthenticated;
  }
}
