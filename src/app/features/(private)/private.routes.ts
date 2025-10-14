import { Routes } from '@angular/router';
import { BusinessGuard } from '@app/core/guards/business.guard';
import { HomeLayoutComponent } from '../../shared/layouts/home-layout/home-layout.component';
import { PrivateLayoutComponent } from '../../shared/layouts/private-layout/private-layout.component';
import { BookingComponent } from './bookings/pages/booking.component';
import { BookingDetailsComponent } from './bookings/pages/booking/booking-details.component';
import { CreateBookingComponent } from './bookings/pages/create/create-booking.component';
import { MyClientsComponent } from './clients/pages/my-clients.component';
import { ConfigureBusinessComponent } from './configure/pages/business/configure-business.component';
import { BusinessLinksComponent } from './configure/pages/business/pages/links/business-links.component';
import { BusinessTimesComponent } from './configure/pages/business/pages/times/business-times.component';
import { ConfigureComponent } from './configure/pages/configure.component';
import { ConnectionsComponent } from './configure/pages/connections/connections.component';
import { AcceptInviteComponent } from './configure/pages/invites/accept/accept-invite.component';
import { InvitesComponent } from './configure/pages/invites/invites.component';
import { MembersComponent } from './configure/pages/members/members.component';
import { ConfigureProfileComponent } from './configure/pages/profile/profile.component';
import { HomePageComponent } from './home/pages/home-page.component';
import { PayrollComponent } from './payouts/payroll.component';
import { CreateBusinessComponent } from './select/pages/create/create-business.component';
import { SelectBusinessComponent } from './select/pages/select-business.component';
import { EditServiceComponent } from './services/pages/edit-service/edit-service.component';
import { ServicesComponent } from './services/pages/services.component';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      { path: 'select', pathMatch: 'full', component: SelectBusinessComponent },
      { path: 'create-business', component: CreateBusinessComponent },
      { path: 'invites/accept', component: AcceptInviteComponent },
      {
        path: '',
        canActivate: [BusinessGuard],
        children: [
          {
            path: '',
            component: HomeLayoutComponent,
            children: [
              { path: 'home', component: HomePageComponent },
              { path: 'clients', component: MyClientsComponent },
              { path: 'payroll', component: PayrollComponent },
              {
                path: 'services',
                children: [
                  { path: '', pathMatch: 'full', component: ServicesComponent },
                  { path: 'edit/:serviceId', component: EditServiceComponent },
                ],
              },
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
            children: [
              { path: '', pathMatch: 'full', component: ConnectionsComponent },
              { path: 'business', component: ConfigureBusinessComponent },
              { path: 'business/links', component: BusinessLinksComponent },
              { path: 'business/times', component: BusinessTimesComponent },
              { path: 'profile', component: ConfigureProfileComponent },
              { path: 'invites', component: InvitesComponent },
              { path: 'members', component: MembersComponent },
            ],
          },
        ],
      },
    ],
  },
];
