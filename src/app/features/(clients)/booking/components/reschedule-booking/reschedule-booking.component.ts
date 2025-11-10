import { CommonModule } from '@angular/common'; // Importe
import { Component, computed, effect, inject, Input, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon'; // Importe
import { Service } from '@app/core/models/Service';
import { BookingsService } from '@app/core/services/booking.service';
import { AllTimesComponent } from '@app/features/(private)/bookings/components/all-times/all-times.component';
import { CalendarPickerComponent } from '@app/shared/components/calendar-picker/calendar-picker.component';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { firstValueFrom } from 'rxjs';

dayjs.locale('pt-br');

type Step = 'calendar' | 'slots';

@Component({
  selector: 'app-reschedule-booking', // Adicionei um seletor
  templateUrl: './reschedule-booking.component.html',
  standalone: true,
  imports: [CommonModule, MatIconModule, CalendarPickerComponent, AllTimesComponent],
})
export class RescheduleBookingComponent {
  // --- Inputs ---
  @Input() public readonly services: Service[] = [];
  @Input() public readonly assignedToId!: string;
  @Input() public readonly businessId!: string;

  private dialogRef = inject(MatDialogRef<RescheduleBookingComponent>, { optional: true });
  private dialogData = inject<any>(MAT_DIALOG_DATA, { optional: true });

  public get serviceIds() {
    return this.services.map((s) => s.id);
  }

  // --- Serviços ---
  private readonly bookingsService = inject(BookingsService);

  // --- Sinais de Estado ---
  public currentStep = signal<Step>('calendar');
  public isLoading = signal(true);

  // --- Sinais do Calendário ---
  public currentMonth = signal(dayjs().month());
  public currentYear = signal(dayjs().year());
  public selectedDate = signal<Dayjs | null>(null);
  public availableDays = signal<Set<string>>(new Set());

  // --- Sinais dos Horários ---
  public selectedTime = signal<string | null>(null);

  // Sinal computado para o botão "Continuar"
  public canContinue = computed(() => {
    if (this.currentStep() === 'calendar') {
      return this.selectedDate() !== null;
    }
    return false;
  });

  constructor() {
    if (this.dialogData) {
      this.services = this.dialogData.services || [];
      this.assignedToId = this.dialogData.assignedToId;
      this.businessId = this.dialogData.businessId;
    }

    effect(async () => {
      const month = this.currentMonth();
      const year = this.currentYear();

      this.isLoading.set(true);
      await this.fetchAvaibleDays(year, month);
      this.isLoading.set(false);
    });
  }

  private async fetchAvaibleDays(year: number, month: number): Promise<void> {
    if (this.services.length === 0) {
      this.availableDays.set(new Set());
      return;
    }

    try {
      const serviceIds: string[] = this.services.map((s) => s.id);

      const avaibleDays = await firstValueFrom(
        this.bookingsService.avaibleDays(year, month + 1, serviceIds),
      );

      this.availableDays.set(new Set(avaibleDays.map((d) => dayjs(d).format('YYYY-MM-DD'))));
    } catch (error) {
      console.error('Erro ao buscar dias disponíveis', error);
      this.availableDays.set(new Set());
    }
  }

  // --- Manipuladores de Eventos do Calendário ---
  public onMonthChanged(offset: number): void {
    this.selectedDate.set(null); // Limpa a data selecionada
    const newDate = dayjs(new Date(this.currentYear(), this.currentMonth())).add(offset, 'month');
    this.currentYear.set(newDate.year());
    this.currentMonth.set(newDate.month());
  }

  public onDateSelected(day: Dayjs): void {
    this.selectedDate.set(day);
    this.selectedTime.set(null); // Limpa a hora anterior
  }

  // --- Manipuladores de Eventos dos Horários ---
  public selectTime = (time: string): void => {
    this.selectedTime.set(time);
  };

  // --- Navegação de Etapas ---
  public goToSlotsStep(): void {
    if (!this.canContinue()) return;
    this.currentStep.set('slots');
  }

  public goToCalendarStep(): void {
    this.currentStep.set('calendar');
  }

  public onReschedule(): void {
    if (!this.selectedDate() || !this.selectedTime()) {
      alert('Por favor, selecione uma data e hora.');
      return;
    }

    this.isLoading.set(true);

    const [hours, minutes] = this.selectedTime()!.split(':').map(Number);

    const date = this.selectedDate()?.hour(hours).minute(minutes).second(0).millisecond(0);

    this.dialogRef?.close(date);
  }
}
