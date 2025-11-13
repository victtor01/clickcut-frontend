import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Service } from '@app/core/models/Service';
import { BookingsService } from '@app/core/services/booking.service';
import { ServicesService } from '@app/core/services/services.service';
import { AllTimesComponent } from '@app/features/(private)/bookings/components/all-times/all-times.component';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { firstValueFrom } from 'rxjs';

import { CalendarPickerComponent } from '../calendar-picker/calendar-picker.component';

dayjs.locale('pt-br');

type Step = 'services' | 'calendar' | 'slots';

@Component({
  selector: 'app-create-booking-navbar',
  imports: [CommonModule, MatIconModule, AllTimesComponent, CalendarPickerComponent],
  templateUrl: './create-booking.component.html',
})
export class CreateBookingNavbar implements OnInit {
  // --- Serviços ---
  private readonly servicesService = inject(ServicesService);
  private readonly bookingsService = inject(BookingsService);

  // --- Sinais de Estado (Pai) ---
  public services = signal<Service[]>([]);
  public selectedServices = signal<string[]>([]);
  public currentStep = signal<Step>('services');
  public isLoadingNextStep = signal(false);
  public selectedTime?: string;

  // --- Sinais de Calendário (Pai gerencia o estado) ---
  public currentMonth = signal(dayjs().month());
  public currentYear = signal(dayjs().year());
  public selectedDate = signal<Dayjs | null>(null);
  public availableDays = signal<Set<string>>(new Set());

  // Sinal computado para o botão "Continuar"
  public canContinue = computed(() => {
    if (this.currentStep() === 'services') {
      return this.selectedServices().length > 0;
    }
    if (this.currentStep() === 'calendar') {
      return this.selectedDate() !== null;
    }
    if (this.currentStep() === 'slots') {
      return this.selectedTime !== null;
    }
    return false;
  });

  constructor() {
    // Efeito para buscar dados quando a etapa do calendário for ativada
    effect(async () => {
      const step = this.currentStep();
      const month = this.currentMonth();
      const year = this.currentYear();

      if (step === 'calendar') {
        this.isLoadingNextStep.set(true);
        await this.fetchAvaibleDays(year, month);
        this.isLoadingNextStep.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.fetchServices();
  }

  public isServiceSelected(service: Service): boolean {
    return this.selectedServices().includes(service.id);
  }

  public selectBookings(service: Service): void {
    this.selectedServices.update((current) => {
      const isSelected = current.find((id) => id === service.id);
      return isSelected
        ? current.filter((id) => id !== service.id) // Remove
        : [...current, service.id]; // Adiciona
    });
  }

  public selectTime = (time: string): void => {
    this.selectedTime = time;
  };

  private async fetchServices(): Promise<void> {
    try {
      const services = await firstValueFrom(this.servicesService.getAll());
      this.services.set(services);
    } catch (error) {
      console.log(error);
    }
  }

  public goStep(): void {
    if (!this.canContinue()) return; // Corrigido para usar o computed

    const currStep = this.currentStep();
    const steps: Record<Step, Step> = {
      services: 'calendar',
      calendar: 'slots',
      slots: 'slots',
    };
    const newStep = steps[currStep];
    this.currentStep.set(newStep);

    if (newStep === 'slots') {
      // logica aqui
    }
  }

  public goToServiceStep(): void {
    this.currentStep.set('services');
  }

  private async fetchAvaibleDays(year: number, month: number): Promise<void> {
    try {
      const avaibleDays = await firstValueFrom(
        this.bookingsService.avaibleDays(year, month + 1, this.selectedServices()),
      );
      this.availableDays.set(new Set(avaibleDays.map((d) => dayjs(d).format('YYYY-MM-DD'))));
    } catch (error) {
      console.error('Erro ao buscar dias disponíveis', error);
      this.availableDays.set(new Set());
    }
  }

  /**
   * ✨ CORRIGIDO: Este método é chamado pelo (monthChanged) do filho
   */
  public onMonthChanged(offset: number): void {
    this.selectedDate.set(null); // Limpa a data selecionada
    const newDate = dayjs(new Date(this.currentYear(), this.currentMonth())).add(offset, 'month');
    this.currentYear.set(newDate.year());
    this.currentMonth.set(newDate.month());
  }

  /**
   * ✨ CORRIGIDO: Este método é chamado pelo (dateSelected) do filho
   * O parâmetro 'day' agora é do tipo 'CalendarDay'.
   */
public onDateSelected(date: Dayjs): void {
    this.selectedDate.set(date);
    this.currentYear.set(date.year());
    this.currentMonth.set(date.month());
  }
  
  public close() {
    // this.dialogRef.close();
  }

}