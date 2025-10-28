import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
// import { BookingService } from '@app/core/services/booking.service';
// import { MatDialog } from '@angular/material/dialog';
// import { RegisterPaymentModalComponent } from '@app/modals/register-payment-modal/register-payment-modal.component';

// DTO de exemplo
export interface PendingBookingDTO {
  id: string;
  clientName: string;
  clientPhotoUrl?: string;
  serviceNames: string;
  endedAt: string;
  totalAmount: number; // Em centavos
}

@Component({
  selector: 'pending-payments', // ✨ Seu seletor (renomeado de 'pending-payments')
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-payments.component.html',
})
export class PendingPaymentsComponent implements OnInit {
  public isLoading = signal(true);
  public pendingBookings = signal<PendingBookingDTO[]>([]);

  async ngOnInit(): Promise<void> {
    await this.fetchPendingBookings();
  }

  async fetchPendingBookings(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Dados mocados para o exemplo:
      const mockBookings: PendingBookingDTO[] = [
        {
          id: 'booking-1',
          clientName: 'Maria Clara',
          // clientPhotoUrl: 'https://exemplo.com/foto-maria.png',
          serviceNames: 'Corte Degradê & Barba',
          endedAt: '2025-10-26T14:30:00Z',
          totalAmount: 4500,
        },
        {
          id: 'booking-2',
          clientName: 'Carlos Silva',
          clientPhotoUrl: undefined,
          serviceNames: 'Hidratação Capilar',
          endedAt: '2025-10-25T18:00:00Z',
          totalAmount: 8000,
        },
      ];
      this.pendingBookings.set(mockBookings);
    } catch (error) {
      console.error('Erro ao buscar agendamentos pendentes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  registerPayment(booking: PendingBookingDTO): void {
    console.log('Abrir modal de pagamento para:', booking.id);
    // this.dialog.open(RegisterPaymentModalComponent, { data: booking });
  }

  viewDetails(booking: PendingBookingDTO): void {
    console.log('Abrir detalhes de:', booking.id);
  }
}
