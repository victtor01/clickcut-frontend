import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Booking } from '@app/core/models/Booking';
import { TimeSlot } from '@app/core/models/Business';
import { AvaibleTimesDTO } from '@app/core/schemas/avaible-times.dto';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import dayjs from 'dayjs';

type SearchTimeDTO = {
  assignedToId?: string;
  businessId?: string;
};

export interface TimelineItem {
  type: 'slot' | 'booking' | 'closed';
  time: string;
  label: string;
  data?: any;
}

@Component({
  templateUrl: './all-times.component.html',
  selector: 'all-times',
  standalone: true,
  imports: [CommonModule],
})
export class AllTimesComponent implements OnInit, OnChanges {
  private readonly toastService = inject(ToastService);
  private readonly businessService = inject(BusinessService);
  private readonly appointmentsService = inject(AppointmentsService);

  @Input() public serviceIds?: string[];
  @Input() public booking?: SearchTimeDTO;
  @Input() public selectedTime?: string | null;
  @Input() public currentDate?: string;
  @Input() public whenSelectAction?: (time: string) => void;

  @Input() public existingBookings: Booking[] = [];
  @Input() public workingHours: TimeSlot[] = [];

  private _times: string[] = [];
  public timelineItems: TimelineItem[] = [];

  get times() {
    return this._times;
  }

  public ngOnInit(): void {
    // Carrega os horários (Isso chama o buildTimeline no final)
    this.loadTimes();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // Se os inputs mudarem, recria a timeline
    if (changes['existingBookings'] || changes['workingHours'] || changes['currentDate']) {
      this.buildTimeline();
    }
  }

  public onClick(time: string): void {
    if (this.whenSelectAction) this.whenSelectAction(time);
  }

  private loadTimes() {
    if (!this.serviceIds || !this.currentDate) return;

    const dateValue = this.currentDate;

    const observer = {
      next: (value: string[]) => {
        // ✨ ATENÇÃO: Aqui recebemos os horários disponíveis da API
        console.log('Horários recebidos da API:', value);
        this._times = value;
        this.buildTimeline();
      },
      error: () => this.toastService.error('Não foi possível encontrar horários.'),
    };

    if (this.booking?.businessId && this.booking.assignedToId) {
      const data = {
        serviceIds: this.serviceIds,
        businessId: this.booking.businessId,
        assignedToId: this.booking.assignedToId,
        date: this.currentDate,
      } satisfies AvaibleTimesDTO;
      this.appointmentsService.availableTimes(data).subscribe(observer);
    } else {
      this.businessService.avaibleTimes(this.serviceIds, dateValue).subscribe(observer);
    }
  }

  private buildTimeline() {
    const items: TimelineItem[] = [];
    const currentDayObj = this.currentDate ? dayjs(this.currentDate) : dayjs();

    // 1. Adiciona Slots Livres (PRIORIDADE MÁXIMA)
    if (this._times && this._times.length > 0) {
      this._times.forEach((time) => {
        // Garante formato HH:mm
        const formatted = time.length > 5 ? time.substring(0, 5) : time;
        items.push({ type: 'slot', time: formatted, label: formatted, data: time });
      });
    }

    // 2. Adiciona Agendamentos Existentes
    if (this.existingBookings && this.existingBookings.length > 0) {
      const targetDateStr = currentDayObj.format('YYYY-MM-DD');

      this.existingBookings.forEach((booking) => {
        const bookingDateStr = dayjs(booking.startAt).format('YYYY-MM-DD');

        // Só adiciona se for do mesmo dia
        if (bookingDateStr === targetDateStr) {
          const time = dayjs(booking.startAt).format('HH:mm');
          const endTime = dayjs(booking.endAt).format('HH:mm');
          items.push({
            type: 'booking',
            time: time,
            label: `${time} - ${endTime}`,
            data: booking,
          });
        }
      });
    }

    // 3. Lógica de "Fechado" (Gap Filling)
    const dayOfWeek = currentDayObj.day(); // 0 = Domingo

    // Filtra os turnos de trabalho para o dia
    const todayWorkSlots = this.workingHours.filter(
      (w) => String(w.dayOfWeek) === String(dayOfWeek),
    );

    if (todayWorkSlots.length > 0) {
      // Ordena os turnos (ex: Manhã e Tarde)
      todayWorkSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      let cursor = '00:00';

      todayWorkSlots.forEach((slot) => {
        // Normaliza para HH:mm
        const start = slot.startTime.substring(0, 5);
        const end = slot.endTime.substring(0, 5);

        // Se existe um buraco entre o cursor e o início do turno
        if (cursor < start) {
          items.push({
            type: 'closed',
            time: cursor,
            label: this.getPeriodLabel(cursor),
          });
        }

        // Avança o cursor para o fim deste turno
        if (end > cursor) cursor = end;
      });

      // Se sobrou tempo no final do dia
      if (cursor < '23:59') {
        items.push({
          type: 'closed',
          time: cursor,
          label: this.getPeriodLabel(cursor),
        });
      }
    } else {
      // Se não tem workingHours, mas a lista de _times está vazia, então não atende
      if (items.length === 0) {
        items.push({ type: 'closed', time: '00:00', label: 'Não há atendimento hoje' });
      }
    }

    // 4. Ordenação Final e Remoção de Duplicatas (Slot vs Fechado)
    // Se houver conflito (ex: 09:00 Slot e 09:00 Fechado), o Slot ganha.

    // Primeiro ordena
    items.sort((a, b) => a.time.localeCompare(b.time));

    // Filtra duplicatas de horário (priorizando slot > booking > closed)
    const uniqueItemsMap = new Map<string, TimelineItem>();
    items.forEach((item) => {
      const existing = uniqueItemsMap.get(item.time);
      if (!existing) {
        uniqueItemsMap.set(item.time, item);
      } else {
        // Se já existe, só sobrescreve se o novo for mais importante
        // Ordem de prioridade: slot (3) > booking (2) > closed (1)
        const priority = (type: string) => (type === 'slot' ? 3 : type === 'booking' ? 2 : 1);
        if (priority(item.type) > priority(existing.type)) {
          uniqueItemsMap.set(item.time, item);
        }
      }
    });

    this.timelineItems = Array.from(uniqueItemsMap.values()).sort((a, b) =>
      a.time.localeCompare(b.time),
    );
  }

  /**
   * Gera o texto "Fechado pela Manhã", etc.
   */
  private getPeriodLabel(start: string): string {
    const h = parseInt(start.split(':')[0], 10);

    if (h < 6) return 'Fechado (Madrugada)';
    if (h < 12) return 'Fechado pela Manhã';
    if (h >= 12 && h < 14) return 'Pausa para Almoço';
    if (h < 18) return 'Fechado à Tarde';
    return 'Fechado à Noite';
  }
}
