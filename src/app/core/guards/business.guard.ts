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
export class BusinessGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(_: ActivatedRouteSnapshot): MaybeAsync<GuardResult> {
    return this.authService.checkAuthBusiness().pipe(
      map((isAuthenticated) => {
        console.log(isAuthenticated);
        if (isAuthenticated) {
          const t = this.authService.getCurrentUserSnapshot();
          console.log(t);
          return true;
        } else {
          return this.router.createUrlTree(['/select']);
        }
      })
    );
  }
}
