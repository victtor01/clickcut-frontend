import { Component } from '@angular/core';
import { ShowTimeSlotsComponent } from './components/show-time-slots/show-time-slots.component';

@Component({
  template: `<section class="flex px-6 flex-col gap-3">
    <show-time-slots> </show-time-slots>
  </section> `,
  imports: [ShowTimeSlotsComponent],
})
export class BusinessTimesComponent {}
