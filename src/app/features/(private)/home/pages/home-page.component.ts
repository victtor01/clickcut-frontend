import { Component, signal } from '@angular/core';
import { HomeEnterComponent } from '../components/enter-component/home-enter.component';
import { HomeBookingsComponent } from '../components/home-bookings/home-bookings.component';
import { HomeDashboardComponent } from '../components/home-dashboard/home-dashboard.component';
import { PendingPaymentsComponent } from '../components/pending-payments/pending-payments.component';
import { WorkingHoursComponent } from '../components/working-hours/working-hours.component';

@Component({
  templateUrl: 'home-page.component.html',
  imports: [
    HomeDashboardComponent,
    HomeEnterComponent,
    HomeBookingsComponent,
    PendingPaymentsComponent,
    WorkingHoursComponent
  ],
})
export class HomePageComponent {
  public isPromoCardExpanded = signal(false);

  public togglePromoCard(): void {
    this.isPromoCardExpanded.update((v) => !v);
  }
}
