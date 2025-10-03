import { Routes } from '@angular/router';
import { ClientGuard } from '@app/core/guards/client.guard';
import { HubLayoutComponent } from '@app/shared/layouts/hub-layout/hub-layout.component';
import { FavoritesComponent } from './favorites/pages/favorites.component';
import { HubHomeComponent } from './home/hub-home.component';

export const CLIENT_ROUTES: Routes = [
  {
    path: 'hub',
    canActivate: [ClientGuard],
    component: HubLayoutComponent,
    children: [
      { path: 'home', component: HubHomeComponent },
      { path: 'favorites', component: FavoritesComponent },
    ],
  },
];
