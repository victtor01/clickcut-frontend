import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private toastService = inject(ToastService); // Exemplo

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          console.error('Acesso negado globalmente (403 Forbidden)');
          this.toastService.error(
            error?.error?.message || 'Você não tem permissão para essa ação!',
          );
        } 

        if (error.status === 401) {
          console.error('Não autenticado (401 Unauthorized)');
          this.router.navigate(['/login']);
        }

         if (error.status === 402) {
          console.error('Plano inválido');
          this.router.navigate(['/plan']);
        }

        return throwError(() => error);
      }),
    );
  }
}
