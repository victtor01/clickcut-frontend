import { Component } from '@angular/core';
import { HomeEnterComponent } from '../components/enter-component/home-enter.component';
import { HomeBookingsComponent } from '../components/home-bookings/home-bookings.component';
import { HomeDashboardComponent } from '../components/home-dashboard/home-dashboard.component';
import { HomeLastActionsComponent } from "../components/last-actions/home-last-actions.component";

@Component({
  templateUrl: 'home-page.component.html',
  imports: [HomeDashboardComponent, HomeLastActionsComponent, HomeLastActionsComponent, HomeEnterComponent, HomeBookingsComponent],
})
export class HomePageComponent {}
