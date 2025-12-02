import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AllPaymentMethodsComponent } from './components/methods/all-payment-methods.component';
import { MySubscriptionComponent } from './components/subscription/subscription-details.component';

type Tab = 'subscription' | 'methods';

@Component({
  templateUrl: `./my-plan.component.html`,
  imports: [CommonModule, AllPaymentMethodsComponent, MySubscriptionComponent],
})
export class MyPlanComponent {
  public tabSelected = signal<Tab>('subscription');

  public selectTab(tab: Tab) {
    this.tabSelected.set(tab);
  }
}
