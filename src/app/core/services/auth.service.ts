import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, map, Observable, of, tap } from 'rxjs';
import { Business } from '../models/Business';
import { ClientAccount } from '../models/ClientAccount';
import { User } from '../models/User';
import { ApiService } from './api.service';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ClientSession {
  type: 'client';
  client: ClientAccount;
}

export interface ManagerSession {
  type: 'manager';
  business?: Business | null;
  user: User;
}

export type Session = ManagerSession | ClientSession;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated: boolean = false;
  private currentUserSubject = new BehaviorSubject<Session | null>(null);
  private currentBusinessSubject = new BehaviorSubject<Business | null>(null);

  public session$ = this.currentUserSubject.asObservable();

  constructor(private readonly apiService: ApiService) {}

  public checkAuthStatus(): Observable<boolean> {
    return this.apiService.get<ManagerSession>('/users/summary').pipe(
      map((payload) => {
        const session: ManagerSession = {
          type: 'manager',
          user: payload.user,
          business: payload.business,
        };
        this.currentUserSubject.next(session);
        return true;
      }),
      catchError(() => {
        return of(false);
      }),
    );
  }

  public checkAuthBusiness(): Observable<boolean> {
    return this.apiService.get<Business>('/auth/business').pipe(
      tap((message) => {
        this.currentBusinessSubject.next(message);
      }),
      map(() => true),
      catchError(() => {
        this.currentBusinessSubject.next(null);
        return of(false);
      }),
    );
  }

  public checkClientSession(): Observable<boolean> {
    return this.apiService.get<ClientAccount>('/auth/attendee/me').pipe(
      map((clientData) => {
        const session: ClientSession = { type: 'client', client: clientData };
        this.currentUserSubject.next(session);
        return true;
      }),
      catchError(() => {
        return of(false);
      }),
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
        }),
      );
    return res;
  }

  public loginClient(email: string, password: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/attendee', { email, password }).pipe(
      tap(() => {
        this.checkClientSession().subscribe();
      }),
    );
  }

  public get currentUserSnapshot(): Session | null {
    return this.currentUserSubject?.value;
  }

  public isClient(): boolean {
    return this.currentUserSnapshot?.type === 'client';
  }

  public isManager(): boolean {
    return this.currentUserSnapshot?.type === 'manager';
  }

  public getCurrentBusinessSnapshot(): Business | null {
    return this.currentBusinessSubject?.value;
  }

  public isLogged(): boolean {
    return this.isAuthenticated;
  }

  public currentClient$: Observable<ClientAccount> = this.session$.pipe(
    filter((session): session is ClientSession => session?.type === 'client'),
    map((session) => session.client),
  );

  public currentUser$: Observable<User> = this.session$.pipe(
    filter((session): session is ManagerSession => session?.type === 'manager'),
    map((session) => session.user),
  );

  public currentBusiness$: Observable<Business | null | undefined> = this.session$.pipe(
    filter((session): session is ManagerSession => session?.type === 'manager'),
    map((session) => session.business),
  );
}
