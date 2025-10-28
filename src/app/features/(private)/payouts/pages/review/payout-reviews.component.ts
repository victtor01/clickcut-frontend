import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Booking } from '@app/core/models/Booking';
import { PayrollService } from '@app/core/services/payroll.service';
import { firstValueFrom } from 'rxjs';

interface GroupedBooking {
  day: string; // Ex: "01 de outubro, quarta-feira"
  bookings: Booking[];
  dayTotalCommission: number;
}

@Component({
  templateUrl: './payout-reviews.component.html',
  imports: [CommonModule, RouterModule],
})
export class PayoutReviewComponent implements OnInit {
  private readonly payoutService = inject(PayrollService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private payoutId?: string;

  public isLoading = signal(true);
  public groupedBookings = signal<GroupedBooking[]>([]);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const newPayoutId = params['payoutId'];
      if (newPayoutId && newPayoutId !== this.payoutId) {
        this.payoutId = newPayoutId;
        this.getBookings(this.payoutId!);
      } else if (!newPayoutId) {
        this.isLoading.set(false);
      }
    });
  }

  public async getBookings(payoutId: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const fetchedBookings =
        (await firstValueFrom(this.payoutService.getBookings(payoutId))) || [];

      console.log(fetchedBookings);

      this.groupedBookings.set(this.groupBookingsByDay(fetchedBookings));
    } catch (error) {
      console.error('Erro ao buscar agendamentos do payout:', error);
      this.groupedBookings.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private groupBookingsByDay(bookings: Booking[]): GroupedBooking[] {
    // 1. Garante que os bookings estejam ordenados por hora
    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

    // 2. Agrupa os bookings em um Map<string, Booking[]>
    const groupedMap = new Map<string, Booking[]>();
    for (const booking of sortedBookings) {
      // Cria uma chave de dia legível
      const dateKey = new Date(booking.startAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        weekday: 'long',
      });

      if (!groupedMap.has(dateKey)) {
        groupedMap.set(dateKey, []);
      }
      groupedMap.get(dateKey)!.push(booking);
    }

    return Array.from(groupedMap.entries()).map(([day, bookings]) => ({
      day: day,
      bookings: bookings,
      dayTotalCommission: bookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0),
    }));
  }

  public openBookingDetails(booking: Booking): void {
    console.log('Abrir detalhes para:', booking.id);

    this.router.navigate(['/bookings', booking.id]);
  }
}
