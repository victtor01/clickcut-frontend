import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import dayjs, { Dayjs } from 'dayjs';

// A interface para um dia (movida para cá)
export interface CalendarDay {
  date: Dayjs;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isSelected: boolean;
  isToday: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-calendar-picker',
  imports: [CommonModule, MatIconModule],
  templateUrl: './calendar-picker.component.html',
})
export class CalendarPickerComponent implements OnChanges {
  // --- ENTRADAS (Inputs) ---
  @Input() availableDays: Set<string> = new Set();
  @Input() isLoading = false;
  @Input() month: number = dayjs().month();
  @Input() year: number = dayjs().year();
  @Input() selectedDate: Dayjs | null = null;

  // --- SAÍDAS (Outputs) ---
  @Output() monthChanged = new EventEmitter<number>();
  @Output() dateSelected = new EventEmitter<Dayjs>();

  // --- Estado Interno (Apenas para Renderização) ---
  public calendarGrid = signal<CalendarDay[]>([]);
  public currentMonthName = computed(() => {
    return dayjs(new Date(this.year, this.month)).format('MMMM [de] YYYY');
  });

  constructor() {
    this.generateCalendarGrid(); // Gera o grid inicial
  }

  /**
   * Ouve por mudanças nos @Inputs e regera o calendário.
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Se qualquer um dos dados de entrada mudar (mês, ano, dias disponíveis, etc.),
    // o calendário é gerado novamente para refletir o novo estado.
    this.generateCalendarGrid();
  }

  /**
   * Gera a grade de 42 dias para o calendário.
   * (Esta é a sua lógica, movida do componente pai).
   */
  private generateCalendarGrid(): void {
    const grid: CalendarDay[] = [];
    const firstDayOfMonth = dayjs(new Date(this.year, this.month, 1));
    const firstDayOfWeek = firstDayOfMonth.day();
    const daysInMonth = firstDayOfMonth.daysInMonth();

    // 1. Dias do mês anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = firstDayOfMonth.subtract(firstDayOfWeek - i, 'day');
      grid.push({
        date,
        isCurrentMonth: false,
        isAvailable: false,
        isSelected: false,
        isToday: false, // Dias do mês anterior nunca são "hoje"
        isPast: true, // Dias do mês anterior são sempre "passado"
      });
    }

    const today = dayjs().startOf('day');

    for (let i = 1; i <= daysInMonth; i++) {
      const date = dayjs(new Date(this.year, this.month, i));
      const dateKey = date.format('YYYY-MM-DD');
      const isAvailable = this.availableDays.has(dateKey);

      const isToday = date.isSame(today, 'day');
      const isPast = date.isBefore(today, 'day');

      grid.push({
        date,
        isCurrentMonth: true,
        isAvailable: isAvailable,
        isSelected: this.selectedDate?.isSame(date, 'day') ?? false,
        isToday: isToday,
        isPast: isPast,
      });
    }

    // 3. Dias do próximo mês
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      const date = firstDayOfMonth.add(1, 'month').date(i);
      grid.push({
        date,
        isCurrentMonth: false,
        isAvailable: false,
        isSelected: false,
        isToday: false, // Dias do próximo mês nunca são "hoje"
        isPast: false, // Dias do próximo mês nunca são "passado"
      });
    }

    this.calendarGrid.set(grid);
  }

  public selectDate(day: CalendarDay): void {
    if (!day.isAvailable || !day.isCurrentMonth) return;
    this.dateSelected.emit(day.date);
  }

  public changeMonth(offset: number): void {
    this.monthChanged.emit(offset);
  }
}
