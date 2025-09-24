import { Routes } from '@angular/router';
import { ValidateBookingComponent } from './appointment/pages/confirm/validate-booking.component';
import { AppointMeetComponent } from './appointment/pages/create/public-business.component';
import { LoginComponent } from './login/pages/login.component';
import { RegisterComponent } from './register/pages/register.component';
import { SignupComponent } from './signup-hub/signup-hub.component';

export const PUBLIC_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'appointments/:businessId', component: AppointMeetComponent },
  { path: 'appointments/confirm/:bookingId', component: ValidateBookingComponent },
  {
    path: 'hub',
    children: [{ path: 'signup', pathMatch: 'full', component: SignupComponent }],
  },
];
