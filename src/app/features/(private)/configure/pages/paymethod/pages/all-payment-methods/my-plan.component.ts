import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { solarVerifiedCheckBold, solarWalletBold } from '@ng-icons/solar-icons/bold';
import { AllPaymentMethodsComponent } from './components/methods/all-payment-methods.component';
import { MySubscriptionComponent } from './components/subscription/subscription-details.component';

type Tab = 'subscription' | 'methods';

const icons = {
  solarVerifiedCheckBold,
  solarWalletBold
}

@Component({
  templateUrl: `./my-plan.component.html`,
  providers: [provideIcons(icons)],
  imports: [CommonModule, AllPaymentMethodsComponent, MySubscriptionComponent, NgIconComponent],
})
export class MyPlanComponent {
  public tabSelected = signal<Tab>('subscription');

  public selectTab(tab: Tab) {
    this.tabSelected.set(tab);
  }
}
