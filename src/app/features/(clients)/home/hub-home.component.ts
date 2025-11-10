import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon'; // ✨ Importado MatIconModule
import { Router, RouterModule } from '@angular/router'; // ✨ Importado RouterModule
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { BookingService } from '@app/core/models/BookingService';
import { AttendeeService } from '@app/core/services/attendee.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-hub-home', // ✨ Adicionado um seletor
  templateUrl: './hub-home.component.html',
  standalone: true, // ✨ Convertido para Standalone
  imports: [
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
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS')
      // Corrigido: ordenando por data de início (ascendente)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
  );

  public pendingPaymentBookings = computed(() =>
    this.allBookings()
      .filter((b) => b.status === 'COMPLETED')
      .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()),
  );

  // O 'pastBookings' (Histórico) foi removido como solicitado.

  // Objeto de estilos de status (com os novos status preenchidos)
  public readonly statusStyles: {
    [key in BookingStatus]: { text: string; icon: string; classes: string };
  } = {
    CREATED: {
      text: 'Criado',
      icon: 'add_circle_outline',
      classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
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

  // ✨ Métodos do menu "três pontos" restaurados
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
    // Corrigido para usar finalPrice, se existir, senão price
    return services.reduce((total, service) => total + (service.finalPrice || service.price), 0);
  }

  public registerPayment(booking: Booking): void {
    console.log('Abrir modal de pagamento para:', booking.id);
    this.closeSettings();
    // Ex: this.dialog.open(RegisterPaymentModalComponent, { data: booking });
  }

  public openReschedule(booking: Booking): void {
    this.closeSettings();
    // this.dialog.open(RescheduleBookingComponent, {
    //   data: {
    //     services: booking?.services.map(bs => bs.service),
    //     assignedToId: booking.assignedTo?.id,
    //     businessId: booking?.business.id
    //   }
    // });
  }

  public cancelBooking(booking: Booking): void {
    console.log('Abrir modal de cancelamento para:', booking.id);
    this.closeSettings();
    // Ex: this.dialog.open(CancelBookingModalComponent, { data: booking });
  }
}
