import { Routes } from '@angular/router';
import { ValidateBookingComponent } from './business/pages/pages/confirm/validate-booking.component';
import { AppointMeetComponent } from './business/pages/pages/create/public-business.component';
import { LoginComponent } from './login/pages/login.component';
import { RegisterComponent } from './register/pages/register.component';

export const PUBLIC_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'appointments/:businessId', component: AppointMeetComponent },
  { path: 'appointments/confirm/:bookingId', component: ValidateBookingComponent },
];
