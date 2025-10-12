import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
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
				console.log("teste")
        // ✨ A VERIFICAÇÃO GLOBAL ACONTECE AQUI ✨
        if (error.status === 403) {
          console.error('Acesso negado globalmente (403 Forbidden)');
					this.toastService.error("você não tem permissão para essa ação");
        }

        // Se for 401 (não autenticado), redireciona para o login
        if (error.status === 401) {
          console.error('Não autenticado (401 Unauthorized)');
          this.router.navigate(['/login']);
        }
        
        // Re-lança o erro para que os handlers locais (se existirem) ainda possam capturá-lo.
        return throwError(() => error);
      })
    );
  }
}