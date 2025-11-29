import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Booking } from '@app/core/models/Booking';
import { Payout } from '@app/core/models/Payout';
import { PayrollService } from '@app/core/services/payroll.service';
import { firstValueFrom } from 'rxjs';

interface GroupedBooking {
  day: string;
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
private http = inject(HttpClient);
  private payoutId?: string;

  public isDownloading = signal(false); // ✨ 4. Signal para o estado de download
  public isLoading = signal(true);
  public groupedBookings = signal<GroupedBooking[]>([]);
  public payout = signal<Payout | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const newPayoutId = params['payoutId'];

      if (newPayoutId && newPayoutId !== this.payoutId) {
        this.payoutId = newPayoutId;
        this.getBookings(newPayoutId);
        this.findPayout(newPayoutId);
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

      this.groupedBookings.set(this.groupBookingsByDay(fetchedBookings));
    } catch (error) {
      console.error('Erro ao buscar agendamentos do payout:', error);
      this.groupedBookings.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private groupBookingsByDay(bookings: Booking[]): GroupedBooking[] {
    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

    const groupedMap = new Map<string, Booking[]>();
    for (const booking of sortedBookings) {
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

  public async downloadProof(url: string, payoutId: string): Promise<void> {
    if (this.isDownloading()) return; // Previne cliques duplos
    this.isDownloading.set(true);

    try {
      // 1. Usa o HttpClient para buscar o arquivo como um 'blob'
      const blob = await firstValueFrom(this.http.get(url, { responseType: 'blob' }));

      // 2. Cria um link <a> "falso" na memória
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;

      // 3. Define o nome do arquivo (assume que é .jpg por causa do seu S3 service)
      a.download = `comprovante-payout-${payoutId}.jpg`;

      // 4. "Clica" no link para iniciar o download e depois o remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 5. Limpa o objeto URL da memória
      URL.revokeObjectURL(objectUrl);

    } catch (err) {
      console.error("Erro ao baixar o comprovante:", err);
      // this.toastService.error("Erro ao baixar o comprovante.");
    } finally {
      this.isDownloading.set(false);
    }
  }

  // private routes

  private async findPayout(id: string): Promise<void> {
    try {
      const payout = await firstValueFrom(this.payoutService.findById(id));

      this.payout.set(payout);
    } catch (ex) {
      if (ex instanceof HttpErrorResponse) {
      }
    }
  }
}
