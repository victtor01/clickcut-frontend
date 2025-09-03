import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TimeSlot } from '@app/core/models/Business';
import { ShowTimeSlotsComponent } from './components/show-time-slots/show-time-slots.component';

export interface WeeklySchedule {
  [day: number]: {
    isActive: boolean;
    slots: TimeSlot[];
  };
}

@Component({
  templateUrl: 'configure-business.component.html',
  imports: [CommonModule, ShowTimeSlotsComponent],
  styles: `
  :host {
    display: block;
    width: 100%;
  }`,
})
export class ConfigureBusinessComponent {}
