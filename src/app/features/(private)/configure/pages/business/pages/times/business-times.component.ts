import { Component } from '@angular/core';
import { MemberTimesComponent } from './components/member-times-slots/member-times.component';
import { ShowTimeSlotsComponent } from './components/show-time-slots/show-time-slots.component';

@Component({
  template: `<section class="flex px-6 flex-col gap-3">
    <show-time-slots> </show-time-slots>
    <member-times> </member-times>
  </section> `,
  imports: [ShowTimeSlotsComponent, MemberTimesComponent],
})
export class BusinessTimesComponent {}
