import { Routes } from '@angular/router';
import { BusinessGuard } from '@app/core/guards/business.guard';
import { HomeLayoutComponent } from '../../shared/layouts/home-layout/home-layout.component';
import { PrivateLayoutComponent } from '../../shared/layouts/private-layout/private-layout.component';
import { BookingComponent } from './bookings/pages/booking.component';
import { BookingDetailsComponent } from './bookings/pages/booking/booking-details.component';
import { CreateBookingComponent } from './bookings/pages/create/create-booking.component';
import { MyClientsComponent } from './clients/pages/my-clients.component';
import { ConfigureBusinessComponent } from './configure/pages/business/configure-business.component';
import { BusinessAddressComponent } from './configure/pages/business/pages/address/business-address.component';
import { BusinessLinksComponent } from './configure/pages/business/pages/links/business-links.component';
import { BusinessTimesComponent } from './configure/pages/business/pages/times/business-times.component';
import { ConfigureComponent } from './configure/pages/configure.component';
import { ConnectionsComponent } from './configure/pages/connections/connections.component';
import { AcceptInviteComponent } from './configure/pages/invites/accept/accept-invite.component';
import { InvitesComponent } from './configure/pages/invites/invites.component';
import { ConfigureMembersComponent } from './configure/pages/members/members.component';
import { MyPlanComponent } from './configure/pages/paymethod/pages/all-payment-methods/my-plan.component';
import { CreatePaymentMethodComponent } from './configure/pages/paymethod/pages/create-payment-method/create-payment-method.component';
import { ConfigureProfileComponent } from './configure/pages/profile/profile.component';
import { SecurityComponent } from './configure/pages/security/security.component';
import { HomePageComponent } from './home/pages/home-page.component';
import { IntegrateComponent } from './integrate/integrate.component';
import { MarketingGenerator } from './marketing/pages/generator/pages/marketing-generator.component';
import { MembersComponent } from './members/members.component';
import { PayoutReviewComponent } from './payouts/pages/review/payout-reviews.component';
import { PayrollComponent } from './payouts/payroll.component';
import { PlanComponent } from './plan/plan.component';
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
      { path: 'plan', component: PlanComponent },
      { path: 'create-business', component: CreateBusinessComponent },
      { path: 'invites/accept', component: AcceptInviteComponent },
      {
        path: '',
        canActivate: [BusinessGuard],
        children: [
          {
            path: '',
            component: HomeLayoutComponent,
            data: { animation: 'HomeLayoutPage' },
            children: [
              { path: 'home', component: HomePageComponent },
              { path: 'members', component: MembersComponent },
              { path: 'clients', component: MyClientsComponent },
              { path: 'marketing', component: MarketingGenerator },
              {
                path: 'payroll',
                children: [
                  { path: '', component: PayrollComponent, pathMatch: 'full' },
                  { path: 'review', component: PayoutReviewComponent },
                ],
              },
              {
                path: 'services',
                children: [
                  { path: '', pathMatch: 'full', component: ServicesComponent },
                  { path: 'edit/:serviceId', component: EditServiceComponent },
                ],
              },
              {
                path: 'integrations',
                component: IntegrateComponent,
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
            data: { animation: 'ConfigurePage' },
            children: [
              { path: '', pathMatch: 'full', component: ConnectionsComponent },
              {
                path: 'pay-methods',
                children: [
                  { path: '', pathMatch: 'full', component: MyPlanComponent },
                  { path: 'create', component: CreatePaymentMethodComponent },
                ],
              },
              { path: 'business', component: ConfigureBusinessComponent },
              { path: 'business/links', component: BusinessLinksComponent },
              { path: 'business/times', component: BusinessTimesComponent },
              { path: 'business/address', component: BusinessAddressComponent },
              { path: 'security', component: SecurityComponent },
              { path: 'profile', component: ConfigureProfileComponent },
              { path: 'invites', component: InvitesComponent },
              { path: 'members', component: ConfigureMembersComponent },
            ],
          },
        ],
      },
    ],
  },
];
