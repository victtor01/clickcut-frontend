import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, tap } from 'rxjs';
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
  user: User;
}

export type Session = ManagerSession | ClientSession;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Session | null>(null);
  public session$ = this.currentUserSubject.asObservable();

  private currentBusinessSubject = new BehaviorSubject<Business | null>(null);
  public currentBusiness$ = this.currentBusinessSubject.asObservable();

  constructor(private readonly apiService: ApiService) {}

  /**
   * Verifica a autenticação do USUÁRIO (manager). Não se preocupa com o business.
   * Retorna 'true' se o usuário estiver logado.
   */
  public checkAuthStatus(): Observable<boolean> {
    return this.apiService.get<User>('/users/summary').pipe(
      map((user) => {
        const session: ManagerSession = { type: 'manager', user: user };
        console.log(user)
        this.currentUserSubject.next(session);
        this.currentBusinessSubject.next(null);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      }),
    );
  }

  /**
   * Tenta carregar o CONTEXTO de um negócio para o manager já logado.
   * Retorna 'true' se um negócio for carregado com sucesso.
   */
  public checkAuthBusiness(): Observable<boolean> {
    return this.apiService.get<Business>('/auth/business').pipe(
      tap((business) => {
        this.currentBusinessSubject.next(business);
      }),
      map(() => true),
      catchError(() => {
        this.currentBusinessSubject.next(null);
        return of(false);
      }),
    );
  }

  // checkClientSession permanece o mesmo
  public checkClientSession(): Observable<boolean> {
    return this.apiService.get<ClientAccount>('/auth/attendee/me').pipe(
      map((clientData) => {
        const session: ClientSession = { type: 'client', client: clientData };
        this.currentUserSubject.next(session);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      }),
    );
  }

  /**
   * Realiza o login do Manager e, em seguida, verifica a sessão do usuário.
   */
  public login(email: string, password: string): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>('/auth', { email, password })
      .pipe(switchMap((authResponse) => this.checkAuthStatus().pipe(map(() => authResponse))));
  }

  public loginClient(email: string, password: string): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>('/auth/attendee', { email, password })
      .pipe(switchMap((authResponse) => this.checkClientSession().pipe(map(() => authResponse))));
  }

  /**
   * Limpa AMBOS os estados: usuário e negócio.
   */
  public logout(): void {
    this.currentUserSubject.next(null);
    this.currentBusinessSubject.next(null);
    // Adicionar chamada à API para /auth/logout se necessário
  }

  // --- Selectors e Getters ---

  public get currentUserSnapshot(): Session | null {
    return this.currentUserSubject.value;
  }

  public get currentBusinessSnapshot(): Business | null {
    return this.currentBusinessSubject.value;
  }

  public isLogged(): boolean {
    return !!this.currentUserSubject.value;
  }

  public currentClient$: Observable<ClientAccount> = this.session$.pipe(
    filter((session): session is ClientSession => session?.type === 'client'),
    map((session) => session.client),
  );

  public currentUser$: Observable<User> = this.session$.pipe(
    filter((session): session is ManagerSession => session?.type === 'manager'),
    map((session) => session.user),
  );
}
