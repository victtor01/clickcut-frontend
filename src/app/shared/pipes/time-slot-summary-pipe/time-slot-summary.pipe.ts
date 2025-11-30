import { Pipe, PipeTransform } from '@angular/core';
import { TimeSlot } from '@app/core/models/Business';

export interface TimeSlotGroup {
  daysLabel: string; // Ex: "Seg a Sex"
  shifts: string[]; // Ex: ["08h00 - 12h00", "14h00 - 18h00"]
}

@Pipe({ name: 'timeSlotSummary' })
export class TimeSlotSummaryPipe implements PipeTransform {
  private weekDaysLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  private dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    domingo: 0,
    segunda: 1,
    terça: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sábado: 6,
    sabado: 6,
  };

  transform(slots: TimeSlot[] | undefined | null): TimeSlotGroup[] {
    if (!slots || slots.length === 0) {
      return [{ daysLabel: 'Todos os dias', shifts: ['Fechado'] }];
    }

    const scheduleByDay = new Map<number, string[]>();

    // 1. Ordena
    const sortedSlots = [...slots].sort((a, b) => {
      const dayA = this.normalizeDay(a.dayOfWeek);
      const dayB = this.normalizeDay(b.dayOfWeek);
      if (dayA !== dayB) return dayA - dayB;
      return a.startTime.localeCompare(b.startTime);
    });

    // 2. Popula o Map (Dia -> Array de Horários)
    for (let i = 0; i < 7; i++) {
      const daySlots = sortedSlots.filter((s) => this.normalizeDay(s.dayOfWeek) === i);

      if (daySlots.length > 0) {
        const shifts = daySlots.map(
          (s) => `${this.formatTime(s.startTime)} - ${this.formatTime(s.endTime)}`,
        );
        scheduleByDay.set(i, shifts);
      }
    }

    // 3. Agrupa dias iguais
    const result: TimeSlotGroup[] = [];
    let startDay: number | null = null;
    let currentDay: number | null = null;
    let currentShiftsJson = ''; // Usado para comparação rápida de arrays

    for (let i = 0; i <= 7; i++) {
      const shifts = scheduleByDay.get(i) || [];
      const shiftsJson = JSON.stringify(shifts); // Truque para comparar arrays de string

      // Se mudou o horário OU o dia está vazio OU é o fim do loop
      const isChange = shiftsJson !== currentShiftsJson;
      const isEmpty = shifts.length === 0;

      if (isChange) {
        // Fecha o grupo anterior se existia
        if (startDay !== null && currentDay !== null && currentShiftsJson !== '[]') {
          result.push({
            daysLabel: this.formatDayRange(startDay, currentDay),
            shifts: JSON.parse(currentShiftsJson), // Recupera o array original
          });
        }

        // Inicia novo grupo
        if (i < 7 && !isEmpty) {
          startDay = i;
          currentShiftsJson = shiftsJson;
        } else {
          startDay = null;
          currentShiftsJson = '[]';
        }
      }

      if (i < 7) currentDay = i;
    }

    return result;
  }

  /**
   * Converte 'dayOfWeek' (number ou string) para um índice 0-6
   */
  private normalizeDay(day: string | number): number {
    if (typeof day === 'number') {
      return day; // Já é 0-6 (assumindo padrão C# DayOfWeek)
    }

    // Se for string, tenta converter, senão retorna -1
    const lowerDay = day.toLowerCase().trim();
    return this.dayMap[lowerDay] !== undefined ? this.dayMap[lowerDay] : -1;
  }

  private formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}h${minutes}`;
  }

  private formatDayRange(start: number, end: number): string {
    if (start === end) {
      return this.weekDaysLabels[start];
    }
    if (end === start + 1) {
      return `${this.weekDaysLabels[start]} e ${this.weekDaysLabels[end]}`;
    }
    return `${this.weekDaysLabels[start]} a ${this.weekDaysLabels[end]}`;
  }
}
