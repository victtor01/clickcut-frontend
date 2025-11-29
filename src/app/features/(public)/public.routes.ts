import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '@app/shared/layouts/public-layout/public-layout.component';
import { ValidateBookingComponent } from './appointment/pages/confirm/validate-booking.component';
import { AppointMeetComponent } from './appointment/pages/create/public-business.component';
import { ExploreComponent } from './explore/pages/explore/explore.component';
import { ForgotPasswordComponent } from './forgot-password/pages/forgot/forgot-password.compnent';
import { InitialComponent } from './initial/initial.component';
import { LoginComponent } from './login/pages/login.component';
import { RegisterComponent } from './register/pages/register.component';
import { ResetPasswordComponent } from './reset-password/pages/reset-password.component';
import { SignupComponent } from './signup-hub/signup-hub.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', component: InitialComponent },
      { path: 'login', component: LoginComponent },
      { path: 'explore', component: ExploreComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'appointments/:businessId', component: AppointMeetComponent },
      { path: 'appointments/confirm/:bookingId', component: ValidateBookingComponent },
      {
        path: 'hub',
        children: [{ path: 'signup', pathMatch: 'full', component: SignupComponent }],
      },
    ],
  },
];
