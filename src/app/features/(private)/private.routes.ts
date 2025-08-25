import { Routes } from '@angular/router';
import { HomeLayoutComponent } from '../../shared/layouts/home-layout/home-layout.component';
import { PrivateLayoutComponent } from '../../shared/layouts/private-layout/private-layout.component';
import { HomePageComponent } from './home/pages/home-page.component';
import { SelectBusinessComponent } from './select/pages/select-business.component';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      { path: 'select', pathMatch: 'full', component: SelectBusinessComponent },
      {
        path: 'home',
        component: HomeLayoutComponent,
        children: [
          { path: '', pathMatch: 'full', component: HomePageComponent },
        ],
      },
    ],
  },
];
