import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TimeSlot } from '@app/core/models/Business';
import { BusinessService } from '@app/core/services/business.service';

export interface WeeklySchedule {
  [day: number]: {
    isActive: boolean;
    slots: TimeSlot[];
  };
}

@Component({
  templateUrl: 'configure-business.component.html',
  imports: [CommonModule],
  styles: `
  :host {
    display: block;
    width: 100%;
  }`,
})
export class ConfigureBusinessComponent {
  daysOfWeek = [
    { name: 'Domingo', value: 0 },
    { name: 'Segunda-feira', value: 1 },
    { name: 'Terça-feira', value: 2 },
    { name: 'Quarta-feira', value: 3 },
    { name: 'Quinta-feira', value: 4 },
    { name: 'Sexta-feira', value: 5 },
    { name: 'Sábado', value: 6 },
  ];

  public schedule: WeeklySchedule = {};

  constructor(private businessService: BusinessService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.businessService.getTimeSlots().subscribe((timeSlots) => {
      this.schedule = this.groupTimeSlotsByDay(timeSlots);
    });
  }

  private groupTimeSlotsByDay(slots: TimeSlot[]): WeeklySchedule {
    const groupedSchedule: WeeklySchedule = {};

    for (const day of this.daysOfWeek) {
      groupedSchedule[day.value] = { isActive: false, slots: [] };
    }

    for (const slot of slots) {
      groupedSchedule[slot.day as any].isActive = true;
      groupedSchedule[slot.day as any].slots.push(slot);
    }
    return groupedSchedule;
  }

  addTimeSlot(day: number): void {
    // Abre um diálogo (modal) com um formulário para adicionar um novo horário
    // const dialogRef = this.dialog.open(TimeSlotFormComponent, { data: { day } });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     // Lógica para salvar o novo horário e atualizar a tela
    //   }
    // });
    console.log(`Adicionar horário para o dia ${day}`);
  }

  editTimeSlot(slot: TimeSlot): void {
    // Abre o mesmo diálogo, mas com os dados do slot para edição
    // const dialogRef = this.dialog.open(TimeSlotFormComponent, { data: { slot } });
    console.log('Editar:', slot);
  }

  deleteTimeSlot(slotToDelete: TimeSlot): void {
    // Lógica para confirmar e remover o slot
    console.log('Deletar:', slotToDelete);
    // Atualize this.schedule e chame o serviço para salvar
  }

  onDayToggle(day: number, isActive: boolean): void {
    this.schedule[day].isActive = isActive;
    // Se o dia for desativado, você pode querer remover todos os slots dele
    if (!isActive) {
      this.schedule[day].slots = [];
    }
    // Chame o serviço para salvar a alteração
    console.log(`Dia ${day} agora está ${isActive ? 'ativo' : 'inativo'}`);
  }
}
