import { Component } from '@angular/core';
import { HomeEnterComponent } from '../components/enter-component/home-enter.component';
import { HomeBookingsComponent } from '../components/home-bookings/home-bookings.component';
import { HomeDashboardComponent } from '../components/home-dashboard/home-dashboard.component';

@Component({
  templateUrl: 'home-page.component.html',
  imports: [HomeDashboardComponent, HomeEnterComponent, HomeBookingsComponent],
})
export class HomePageComponent {}
