import { Routes } from '@angular/router';
import { BusinessGuard } from '@app/core/guards/business.guard';
import { HomeLayoutComponent } from '../../shared/layouts/home-layout/home-layout.component';
import { PrivateLayoutComponent } from '../../shared/layouts/private-layout/private-layout.component';
import { BookingComponent } from './bookings/pages/booking.component';
import { BookingDetailsComponent } from './bookings/pages/booking/booking-details.component';
import { CreateBookingComponent } from './bookings/pages/create/create-booking.component';
import { ConfigureComponent } from './configure/pages/configure.component';
import { ConnectionsComponent } from './configure/pages/connections/connections.component';
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
              {
                path: 'bookings',
                children: [
                  { path: '', component: BookingComponent, pathMatch: 'full' },
                  { path: 'create', component: CreateBookingComponent },
                  { path: ':bookingId', component: BookingDetailsComponent },
                ],
              },
            ],
          },
          {
            path: 'configure',
            component: ConfigureComponent,
            children: [{ path: '', pathMatch: 'full', component: ConnectionsComponent }],
          },
        ],
      },
    ],
  },
];
