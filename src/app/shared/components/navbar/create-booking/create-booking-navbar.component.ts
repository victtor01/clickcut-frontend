import { CommonModule } from '@angular/common'; // Importe
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'; // Importe
import { Service } from '@app/core/models/Service';
import { BookingsService } from '@app/core/services/booking.service';
import { ServicesService } from '@app/core/services/services.service';
import dayjs, { Dayjs } from 'dayjs'; // Importe Dayjs
import 'dayjs/locale/pt-br'; // Importe o locale
import { firstValueFrom } from 'rxjs';

dayjs.locale('pt-br'); // Defina o locale globalmente

// Interface para o nosso grid de calendário
export interface CalendarDay {
  date: Dayjs;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-create-booking-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule], // Adicione
  templateUrl: './create-booking-navbar.component.html',
})
export class CreateBookingNavbar implements OnInit {
  // --- Serviços ---
  private readonly servicesService = inject(ServicesService);
  private readonly bookingsService = inject(BookingsService);

  // --- Sinais de Estado ---
  public services = signal<Service[]>([]);
  public selectedServices = signal<string[]>([]);
  public currentStep = signal<'services' | 'calendar'>('services');
  public isLoadingNextStep = signal(false);
  public canContinue = computed(() => this.selectedServices().length > 0);

  public currentMonth = signal(dayjs().month());
  public currentYear = signal(dayjs().year());
  public calendarGrid = signal<CalendarDay[]>([]);
  public selectedDate = signal<Dayjs | null>(null);

  // Armazena os dias disponíveis (ex: '2025-10-20') da API
  private availableDays = signal<Set<string>>(new Set());

  public currentMonthName = computed(() => {
    return dayjs(new Date(this.currentYear(), this.currentMonth())).format('MMMM [de] YYYY');
  });

  constructor() {
    effect(async () => {
      const step = this.currentStep();
      const month = this.currentMonth();
      const year = this.currentYear();

      if (step === 'calendar') {
        this.isLoadingNextStep.set(true);
        await this.fetchAvaibleDays(year, month);
        this.generateCalendarGrid(year, month);
        this.isLoadingNextStep.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.fetchServices();
  }

  /**
   * Helper para a UI, verifica se um serviço está selecionado.
   */
  public isServiceSelected(service: Service): boolean {
    return this.selectedServices().includes(service.id);
  }

  /**
   * Adiciona ou remove um serviço da seleção.
   */
  public selectBookings(service: Service) {
    this.selectedServices.update((current) => {
      const isSelected = current.find((id) => id === service.id);

      if (isSelected) {
        return current.filter((id) => id !== service.id); // Remove
      } else {
        return [...current, service.id]; // Adiciona
      }
    });
  }

  private async fetchServices(): Promise<void> {
    try {
      const services = await firstValueFrom(this.servicesService.getAll());
      this.services.set(services);
    } catch (error) {
      console.log(error);
    }
  }

  public goToCalendarStep(): void {
    if (!this.canContinue()) return;
    this.currentStep.set('calendar');
  }

  public goToServiceStep(): void {
    this.currentStep.set('services');
  }

  private async fetchAvaibleDays(year: number, month: number): Promise<void> {
    try {
      const avaibleDays = await firstValueFrom(
        this.bookingsService.avaibleDays(
          year,
          month + 1, 
          this.selectedServices(),
        ),
      );

      console.log(avaibleDays)
      this.availableDays.set(new Set(avaibleDays.map((d) => dayjs(d).format('YYYY-MM-DD'))));
    } catch (error) {
      console.error('Erro ao buscar dias disponíveis', error);
      this.availableDays.set(new Set()); // Limpa em caso de erro
    }
  }

  private generateCalendarGrid(year: number, month: number): void {
    const grid: CalendarDay[] = [];
    const firstDayOfMonth = dayjs(new Date(year, month, 1));
    const firstDayOfWeek = firstDayOfMonth.day(); // 0=Domingo, 1=Segunda, ...
    const daysInMonth = firstDayOfMonth.daysInMonth();
    const availableDaysSet = this.availableDays();

    // 1. Preenche os dias "vazios" do mês anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = firstDayOfMonth.subtract(firstDayOfWeek - i, 'day');
      grid.push({ date, isCurrentMonth: false, isAvailable: false, isSelected: false });
    }

    // 2. Preenche os dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = dayjs(new Date(year, month, i));
      const dateKey = date.format('YYYY-MM-DD');
      const isAvailable = availableDaysSet.has(dateKey);
      grid.push({
        date,
        isCurrentMonth: true,
        isAvailable: isAvailable,
        isSelected: this.selectedDate()?.format('YYYY-MM-DD') === dateKey,
      });
    }

    // 3. Preenche os dias "vazios" do próximo mês (para completar 42 dias)
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      const date = firstDayOfMonth.add(1, 'month').date(i);
      grid.push({ date, isCurrentMonth: false, isAvailable: false, isSelected: false });
    }

    this.calendarGrid.set(grid);
  }

  /**
   * ✨ NOVO: Muda o mês (ex: -1 para anterior, +1 para próximo)
   */
  public changeMonth(offset: number): void {
    this.selectedDate.set(null);

    const newDate = dayjs(new Date(this.currentYear(), this.currentMonth())).add(offset, 'month');
    this.currentYear.set(newDate.year());
    this.currentMonth.set(newDate.month());
  }

  public selectDate(day: CalendarDay): void {
    if (!day.isAvailable || !day.isCurrentMonth) return;
    this.selectedDate.set(day.date);
    this.calendarGrid.update((grid) =>
      grid.map((d) => ({
        ...d,
        isSelected: d.date.isSame(day.date, 'day'),
      })),
    );
  }
}
