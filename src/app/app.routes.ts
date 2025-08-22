import { Routes } from '@angular/router';

export const routes: Routes = [
	 {
    path: '',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/(private)/private.routes').then(
            (e) => e.PRIVATE_ROUTES
          ),
      },
    ],
  },
];
