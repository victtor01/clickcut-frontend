import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router'; // Para o botão de "Configurar"
import { TimeSlot } from '@app/core/models/Business';
import { BusinessService } from '@app/core/services/business.service';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { firstValueFrom } from 'rxjs';

dayjs.locale('pt-br');

type Status = 'LOADING' | 'OPEN' | 'CLOSED' | 'NO_SCHEDULE';

@Component({
  selector: 'app-working-hours',
  templateUrl: './working-hours.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class WorkingHoursComponent implements OnInit {
  public status = signal<Status>('LOADING');
  public statusMessage = signal<string>(''); 
  private allSlots: TimeSlot[] = [];

  private readonly businessService = inject(BusinessService);

  async ngOnInit(): Promise<void> {
    await this.fetchTimesSlotsAndCalculateStatus();
  }

  /**
   * Busca os horários e imediatamente calcula o status atual.
   */
  private async fetchTimesSlotsAndCalculateStatus(): Promise<void> {
    this.status.set('LOADING');
    try {
      this.allSlots = await firstValueFrom(this.businessService.getTimeSlots());

      this.calculateStatus(this.allSlots);
    } catch (error) {
      console.error('Erro ao buscar horários', error);
      this.status.set('NO_SCHEDULE');
      this.statusMessage.set('Não foi possível carregar os horários.');
    }
  }

  /**
   * Processa a lista de TimeSlots para definir o status atual.
   */
  private calculateStatus(slots: TimeSlot[]): void {
    if (!slots || slots.length === 0) {
      this.status.set('NO_SCHEDULE');
      return;
    }

    const now = dayjs();
    const currentDayOfWeek = now.day(); 
    const currentTime = now.format('HH:mm:ss'); 

    const todaySlots = slots
      .filter((s) => s.dayOfWeek === currentDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (const slot of todaySlots) {
      if (currentTime >= slot.startTime && currentTime < slot.endTime) {
        this.status.set('OPEN');
        this.statusMessage.set(`Fecha às ${this.formatTime(slot.endTime)}`);
        return;
      }
    }

    const nextSlotToday = todaySlots.find((s) => s.startTime > currentTime);
    if (nextSlotToday) {
      this.status.set('CLOSED');
      this.statusMessage.set(`Abre hoje às ${this.formatTime(nextSlotToday.startTime)}`);
      return;
    }

		for (let i = 1; i <= 7; i++) {
      const nextDayOfWeek = (currentDayOfWeek + i) % 7;
      const nextDaySlots = slots
        .filter((s) => s.dayOfWeek === nextDayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (nextDaySlots.length > 0) {
        const nextSlot = nextDaySlots[0];
        const dayName = i === 1 ? 'amanhã' : dayjs().add(i, 'day').format('dddd');

        this.status.set('CLOSED');
        this.statusMessage.set(`Abre ${dayName} às ${this.formatTime(nextSlot.startTime)}`);
        return;
      }
    }

    this.status.set('NO_SCHEDULE');
    this.statusMessage.set('Nenhum horário de trabalho futuro definido.');
  }

  private formatTime(time: string): string {
    return time.substring(0, 5);
  }
}
