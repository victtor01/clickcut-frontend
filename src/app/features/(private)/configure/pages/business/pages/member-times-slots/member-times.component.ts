import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { TimeSlot } from '@app/core/models/Business';
import { CreateTimeSlotDTO } from '@app/core/schemas/create-time-slot.dto';
import { MembersService } from '@app/core/services/members.service';
import { ToastService } from '@app/core/services/toast.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { solarShopBold, solarUserBold } from '@ng-icons/solar-icons/bold';
import { firstValueFrom } from 'rxjs';
import { CreateTimeSlotComponent } from '../../components/create-time-slot/create-time-slot.component';

export interface WeeklySchedule {
  [day: number]: {
    isActive: boolean;
    slots: TimeSlot[];
  };
}

const icons = {
  solarUserBold,
  solarShopBold
}

@Component({
  selector: 'member-times',
  templateUrl: './member-times.component.html',
  providers: [provideIcons(icons)],
  imports: [CreateTimeSlotComponent, CommonModule, NgIconComponent],
})
export class MemberTimesComponent implements OnInit {
  private readonly membersService = inject(MembersService);
  private readonly toastService = inject(ToastService);

  public timesSlots: TimeSlot[] = [];
  public hasEditable: boolean = false;
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
    const createTimeSlot = {
      dayOfWeek: day,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
    } satisfies CreateTimeSlotDTO;

    this.timesSlots.push({ ...createTimeSlot, dayOfWeek: day });

    this.schedule = this.groupTimeSlotsByDay(this.timesSlots);

    this.addingSlotToDay = null;
    this.hasEditable = true;
  }

  public async saveOperation(): Promise<void> {
    const times: CreateTimeSlotDTO[] = this.timesSlots.map((ts) => ({
      ...ts,
      dayOfWeek: Number(ts.dayOfWeek),
    }));

    try {
      const updated: TimeSlot[] = await firstValueFrom(this.membersService.createTimeSlots(times));

      this.schedule =  this.groupTimeSlotsByDay(updated);
      this.toastService.success("Atualizado com sucesso!");
      this.hasEditable = false;
    }catch (err){
      let message = "Erro interno, entre em contato com suporte!";
  
      if(err instanceof HttpErrorResponse && err.error.message) message = err.error.message;

      this.toastService.error(message);
    }

  }

  public addTimeSlot(day: number): void {
    this.addingSlotToDay = day;
  }

  private groupTimeSlotsByDay(slots: TimeSlot[]): WeeklySchedule {
    const groupedSchedule: WeeklySchedule = {};

    for (const day of this.daysOfWeek) {
      groupedSchedule[day.value] = { isActive: false, slots: [] };
    }

    for (const slot of slots) {
      groupedSchedule[slot.dayOfWeek as any].isActive = true;
      groupedSchedule[slot.dayOfWeek as any].slots.push(slot);
    }

    return groupedSchedule;
  }

  public removeSlot(slot: TimeSlot): void {
   this.timesSlots = [...this.timesSlots.filter(time => !(time.dayOfWeek === slot.dayOfWeek && time.endTime === slot.endTime && time.startTime === slot.startTime))]
   this.schedule = this.groupTimeSlotsByDay(this.timesSlots);
   this.hasEditable = true;
  }

  private async fetchTimes(): Promise<void> {
    this.timesSlots = await firstValueFrom(this.membersService.findTimesSlots());
    this.schedule = this.groupTimeSlotsByDay(this.timesSlots);
  }
}
