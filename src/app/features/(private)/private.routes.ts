import { Routes } from '@angular/router';
import { BusinessGuard } from '@app/core/guards/business.guard';
import { HomeLayoutComponent } from '../../shared/layouts/home-layout/home-layout.component';
import { PrivateLayoutComponent } from '../../shared/layouts/private-layout/private-layout.component';
import { BookingComponent } from './bookings/pages/booking.component';
import { CreateBookingComponent } from './bookings/pages/create/create-booking.component';
import { HomePageComponent } from './home/pages/home-page.component';
import { SelectBusinessComponent } from './select/pages/select-business.component';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      { path: 'select', pathMatch: 'full', component: SelectBusinessComponent },
      {
        path: '',
        canActivate: [BusinessGuard],
        children: [
          {
            path: '',
            component: HomeLayoutComponent,
            children: [
              { path: 'home', component: HomePageComponent },
              { path: 'bookings', component: BookingComponent },
              { path: 'bookings/create', component: CreateBookingComponent },
            ],
          },
        ],
      },
    ],
  },
];
