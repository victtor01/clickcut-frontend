import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './create-time-slot.component.html',
  selector: 'create-time-slot-form',
  imports: [CommonModule, FormsModule],
})
export class CreateTimeSlotComponent {
  @Output() save = new EventEmitter<{ startTime: string; endTime: string }>();
  @Output() cancel = new EventEmitter<void>();

  startTime: string = '09:00';
  endTime: string = '10:00';

  public onSave(): void {
    if (this.startTime && this.endTime) {
      this.save.emit({ startTime: this.startTime, endTime: this.endTime });
    }
  }

  public onCancel(): void {
    this.cancel.emit();
  }
}
