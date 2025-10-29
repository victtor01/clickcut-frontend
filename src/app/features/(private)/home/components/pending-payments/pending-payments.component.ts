import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from '@app/core/models/Booking';
import { BookingsService } from '@app/core/services/booking.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'pending-payments', // ✨ Seu seletor (renomeado de 'pending-payments')
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-payments.component.html',
})
export class PendingPaymentsComponent implements OnInit {
  public isLoading = signal(true);
  public pendingBookings = signal<Booking[]>([]);

  private readonly bookingService = inject(BookingsService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.fetchPendingBookings();
  }

  async fetchPendingBookings(): Promise<void> {
    this.isLoading.set(true);
    try {
      const bookings = await firstValueFrom(this.bookingService.latests());

      this.pendingBookings.set(bookings);
    } catch (error) {
      console.error('Erro ao buscar agendamentos pendentes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  public getPhotoOfBooking(booking: Booking) {
    const anyServiceWithPhoto = booking?.services?.find((bs) => !!bs.service?.photoUrl);

    return anyServiceWithPhoto?.service?.photoUrl;
  }

  registerPayment(booking: Booking): void {
    this.router.navigate(['/bookings', booking.id]);
  }

  viewDetails(booking: Booking): void {
    console.log('Abrir detalhes de:', booking.id);
  }
}
