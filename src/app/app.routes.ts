import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/(public)/public.routes').then(
            (e) => e.PUBLIC_ROUTES
          ),
      },
      {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./features/(private)/private.routes').then(
            (e) => e.PRIVATE_ROUTES
          ),
      },
    ],
  },
];
