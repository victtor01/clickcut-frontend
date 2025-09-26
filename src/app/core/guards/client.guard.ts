import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	GuardResult,
	MaybeAsync,
	Router,
} from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ClientGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(_: ActivatedRouteSnapshot): MaybeAsync<GuardResult> {
    return this.authService.checkClientSession().pipe(
      map((isAuthenticated) => {
        console.log(isAuthenticated);
        if (isAuthenticated) {
          const t = this.authService.currentUserSnapshot;
          console.log(t);
          return true;
        } else {
          return this.router.createUrlTree(['/home']);
        }
      }),
    );
  }
}
