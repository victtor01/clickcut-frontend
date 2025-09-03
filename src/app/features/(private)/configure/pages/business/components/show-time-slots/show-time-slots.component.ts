import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TimeSlot } from '@app/core/models/Business';
import { CreateTimeSlotDTO } from '@app/core/schemas/create-time-slot.dto';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { CreateTimeSlotComponent } from '../create-time-slot/create-time-slot.component';

export interface WeeklySchedule {
  [day: number]: {
    isActive: boolean;
    slots: TimeSlot[];
  };
}

@Component({
  templateUrl: './show-time-slots.component.html',
  selector: 'show-time-slots',
  imports: [CommonModule, CreateTimeSlotComponent],
})
export class ShowTimeSlotsComponent {
  public daysOfWeek = [
    { name: 'Domingo', value: 0 },
    { name: 'Segunda-feira', value: 1 },
    { name: 'Terça-feira', value: 2 },
    { name: 'Quarta-feira', value: 3 },
    { name: 'Quinta-feira', value: 4 },
    { name: 'Sexta-feira', value: 5 },
    { name: 'Sábado', value: 6 },
  ];

  public schedule: WeeklySchedule = {};
  public addingSlotToDay: number | null = null;

  constructor(private businessService: BusinessService, private toastService: ToastService) {}

  public ngOnInit(): void {
    this.fetchTimeSlots();
  }

  private fetchTimeSlots() {
    this.businessService.getTimeSlots().subscribe((timeSlots) => {
      this.schedule = this.groupTimeSlotsByDay(timeSlots);
    });
  }
  
  private groupTimeSlotsByDay(slots: TimeSlot[]): WeeklySchedule {
    const groupedSchedule: WeeklySchedule = {};

    for (const day of this.daysOfWeek) {
      groupedSchedule[day.value] = { isActive: true, slots: [] };
    }

    for (const slot of slots) {
      groupedSchedule[slot.day as any].isActive = true;
      groupedSchedule[slot.day as any].slots.push(slot);
    }

    return groupedSchedule;
  }

  public addTimeSlot(day: number): void {
    this.addingSlotToDay = day;
    console.log(`Adicionar horário para o dia ${day}`);
  }

  public editTimeSlot(slot: TimeSlot): void {
    console.log('Editar:', slot);
  }

  public deleteTimeSlot(slotToDelete: TimeSlot): void {
    console.log('Deletar:', slotToDelete);
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

    this.businessService.createTimeSlot(createTimeSlot).subscribe({
      next: (e) => {
        console.log(e);
        this.fetchTimeSlots();
      },

      error: (err) => {
        this.toastService.error(err.error?.message);
      },
    });

    this.addingSlotToDay = null;
  }

  
  public onDayToggle(day: number, isActive: boolean): void {
    this.schedule[day].isActive = isActive;

    if (!isActive) {
      this.schedule[day].slots = [];
    }

    console.log(`Dia ${day} agora está ${isActive ? 'ativo' : 'inativo'}`);
  }
}
