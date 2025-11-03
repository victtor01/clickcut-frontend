import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TimeSlot } from '@app/core/models/Business';
import { CreateTimeSlotDTO } from '@app/core/schemas/create-time-slot.dto';
import { MembersService } from '@app/core/services/members.service';
import { firstValueFrom } from 'rxjs';
import { CreateTimeSlotComponent } from '../../../../components/create-time-slot/create-time-slot.component';

export interface WeeklySchedule {
  [day: number]: {
    isActive: boolean;
    slots: TimeSlot[];
  };
}

@Component({
  templateUrl: './member-times.component.html',
  selector: 'member-times',
  imports: [CreateTimeSlotComponent, CommonModule],
})
export class MemberTimesComponent implements OnInit {
  private readonly membersService = inject(MembersService);

  public timesSlots: TimeSlot[] = [];

  public schedule: WeeklySchedule = {};

  public addingSlotToDay: number | null = null;

  public daysOfWeek = [
    { name: 'Domingo', value: 0 },
    { name: 'Segunda-feira', value: 1 },
    { name: 'Terça-feira', value: 2 },
    { name: 'Quarta-feira', value: 3 },
    { name: 'Quinta-feira', value: 4 },
    { name: 'Sexta-feira', value: 5 },
    { name: 'Sábado', value: 6 },
  ];

  ngOnInit(): void {
    this.fetchTimes();
  }

  public handleCancelNewSlot(): void {
    this.addingSlotToDay = null;
  }

  public handleSaveNewSlot(newSlot: { startTime: string; endTime: string }, day: number): void {
    console.log(`Salvando novo horário para o dia ${day}:`, newSlot);

    const createTimeSlot = {
      dayOfWeek: day,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
    } satisfies CreateTimeSlotDTO;

    // this.businessService.createTimeSlot(createTimeSlot).subscribe({
    // 	next: (e) => {
    // 		console.log(e);
    // 		this.fetchTimeSlots();
    // 	},

    // 	error: (err) => {
    // 		this.toastService.error(err.error?.message);
    // 	},
    // });

    this.addingSlotToDay = null;
  }

  public addTimeSlot(day: number): void {
    this.addingSlotToDay = day;
    console.log(`Adicionar horário para o dia ${day}`);
  }

  private groupTimeSlotsByDay(slots: TimeSlot[]): WeeklySchedule {
    const groupedSchedule: WeeklySchedule = {};

    for (const day of this.daysOfWeek) {
      groupedSchedule[day.value] = { isActive: false, slots: [] };
    }

    for (const slot of slots) {
      console.log(slot.day);
      groupedSchedule[slot.day as any].isActive = true;
      groupedSchedule[slot.day as any].slots.push(slot);
    }

    return groupedSchedule;
  }

  private async fetchTimes(): Promise<void> {
    this.timesSlots = await firstValueFrom(this.membersService.findTimesSlots());
    this.schedule = this.groupTimeSlotsByDay(this.timesSlots);
    console.log(this.timesSlots);
  }
}
