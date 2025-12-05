import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon'; // ✨ Importado MatIconModule
import { Router, RouterModule } from '@angular/router'; // ✨ Importado RouterModule
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { BookingService } from '@app/core/models/BookingService';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { AttendeeService } from '@app/core/services/attendee.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { hugeAlertSquare, hugeMoneyReceiveCircle, hugeSent } from '@ng-icons/huge-icons';
import { Dayjs } from 'dayjs';
import { firstValueFrom } from 'rxjs';
import { CancelBookingByClient } from '../booking/components/cancel-booking/cancel-booking.component';
import {
  RescheduleBookingComponent,
  RescheduleBookingDialogData,
} from '../booking/components/reschedule-booking/reschedule-booking.component';

const icons = {
  hugeAlertSquare,
  hugeMoneyReceiveCircle,
  hugeSent,
};

@Component({
  templateUrl: './hub-home.component.html',
  providers: [provideIcons(icons)],
  imports: [
    NgIconComponent,
    CommonModule,
    DatePipe,
    ToFormatBrlPipe,
    RouterModule, // ✨ Adicionado
    MatIconModule, // ✨ Adicionado
  ],
})
export class HubHomeComponent implements OnInit {
  // --- Injeções ---
  private readonly attendeeService = inject(AttendeeService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // --- Sinais de Estado ---
  public isLoading = signal(true);
  public allBookings = signal<Booking[]>([]);

  // ✨ Lógica do menu "três pontos" restaurada
  public openedSettings = signal<string | null>(null);

  // --- Sinais Computados (Listas Separadas) ---
  public upcomingBookings = computed(() =>
    this.allBookings()
      .filter(
        (b) =>
          (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') &&
          new Date(b.startAt) > new Date(),
      )
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
  );

  public lateBookings = computed(() =>
    this.allBookings()
      .filter(
        (b) =>
          (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') &&
          new Date(b.startAt) < new Date(),
      )
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
  );

  public pendingPaymentBookings = computed(() =>
    this.allBookings()
      .filter((b) => b.status === 'COMPLETED')
      .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()),
  );

  // Objeto de estilos de status (com os novos status preenchidos)
  public readonly statusStyles: {
    [key in BookingStatus]: { text: string; icon: string; classes: string };
  } = {
    CREATED: {
      text: 'Criado',
      icon: 'add_circle_outline',
      classes: 'bg-stone-100 text-gray-700 dark:bg-stone-800 dark:text-gray-300',
    },
    PENDING: {
      text: 'Pendente',
      icon: 'pending',
      classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    },
    CONFIRMED: {
      text: 'Confirmado',
      icon: 'check_circle_outline',
      classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    },
    IN_PROGRESS: {
      text: 'Em Andamento',
      icon: 'sync',
      classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    },
    COMPLETED: {
      text: 'Concluído',
      icon: 'check_circle',
      classes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    },
    PAID: {
      text: 'Pago',
      icon: 'paid',
      classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    },
    CANCELLED: {
      text: 'Cancelado',
      icon: 'cancel',
      classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    },
    NO_SHOW: {
      text: 'Não Compareceu',
      icon: 'person_off',
      classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    },
    CANCELLED_BY_CLIENT: {
      text: 'Cancelado',
      icon: 'cancel',
      classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    },
    CANCELLED_BY_MANAGER: {
      text: 'Cancelado',
      icon: 'cancel',
      classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    },
    CANCELLED_LATE_BY_CLIENT: {
      text: 'Cancelado (Tarde)',
      icon: 'cancel',
      classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    },
  };

  ngOnInit(): void {
    this.fetchBookings();
  }

  public async fetchBookings(): Promise<void> {
    this.isLoading.set(true);
    try {
      const bookings = await firstValueFrom(this.attendeeService.getBookings());
      this.allBookings.set(bookings);
    } catch (e) {
      console.error(e);
      this.allBookings.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  public seeDetails(bookingId: string) {
    this.router.navigate(['/hub', 'bookings', bookingId]);
    this.closeSettings(); // Fecha o menu ao navegar
  }

  public toggleOpenedSettings(bookingId: string): void {
    if (this.openedSettings() === bookingId) {
      this.openedSettings.set(null);
    } else {
      this.openedSettings.set(bookingId);
    }
  }

  public closeSettings(): void {
    this.openedSettings.set(null);
  }

  public getTotalPrice(services: BookingService[] | undefined): number {
    if (!services) return 0;
    return services.reduce((total, service) => total + (service.finalPrice || service.price), 0);
  }

  public registerPayment(booking: Booking): void {
    this.closeSettings();
    // Ex: this.dialog.open(RegisterPaymentModalComponent, { data: booking });
  }

  public openReschedule(booking: Booking): void {
    this.closeSettings();

    if (!booking?.services?.length || !booking.assignedTo?.id) {
      return;
    }

    const data = {
      serviceIds: booking?.services.map((bs) => bs.serviceId).map((s) => String(s)),
      assignedToId: booking.assignedTo?.id,
      businessId: booking.business?.id,
      selectedDate: booking.startAt,
    } satisfies RescheduleBookingDialogData;

    const reschedule = this.dialog.open(RescheduleBookingComponent, {
      data,
      maxWidth: '50rem',
      panelClass: ['dialog-no-container'],
      width: 'min(30rem, 100%)',
    });

    reschedule.afterClosed().subscribe((data: Dayjs) => {
      if (!data) return;

      this.appointmentsService.rescheduleByAttendee(booking.id, data.toISOString()).subscribe({
        next: (data) => {
          console.log(data);
        },

        error: (err) => {
          console.log(err);
        },
      });
    });
  }

  public cancelBooking(booking: Booking): void {
    this.closeSettings();

    const cancel = this.dialog.open(CancelBookingByClient, {
      data: { bookingId: booking.id },
      maxWidth: '50rem',
      width: 'min(30rem, 100%)',
    });

    // Ex: this.dialog.open(CancelBookingModalComponent, { data: booking });
  }
}
