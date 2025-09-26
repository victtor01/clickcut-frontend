import { Routes } from '@angular/router';
import { ClientGuard } from '@app/core/guards/client.guard';
import { HubHome } from './home/hub-home.component';

export const CLIENT_ROUTES: Routes = [
  {
    path: 'hub',
    canActivate: [ClientGuard],
    children: [{ path: 'home', component: HubHome }],
  },
];
