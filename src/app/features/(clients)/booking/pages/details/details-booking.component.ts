import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Booking } from '@app/core/models/Booking';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { AllPaymentsComponent } from '@app/features/(private)/bookings/pages/booking/components/all-payments/all-payments.component';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './details-booking.component.html',
  imports: [RouterModule, CommonModule, AllPaymentsComponent, ToFormatBrlPipe],
  styles: [
    `
      .timeline-dot {
        transition: all 0.3s ease;
      }
      .is-complete .timeline-dot {
      }
      .is-complete + div .font-semibold {
        opacity: 0.6;
      }
    `,
  ],
})
export class DetailsBookingComponent {
  public booking?: Booking;
  public bookingId: string | null = null;
  public totalPrice = 0;
  public totalPaid = 0;

  constructor(private readonly appointmentsService: AppointmentsService,private readonly routerActivated: ActivatedRoute,) {
    this.routerActivated.params.subscribe((params) => {
      this.bookingId = params['bookingId'];
    });
  }

  ngOnInit(): void {
    if (this.bookingId) {
      this.fetchBooking(this.bookingId);
    }
  }


  public get porcetagePaid() {
    if (!this.totalPrice || this.totalPrice === 0) return 0;
    return (this.totalPaid / this.totalPrice) * 100;
  }

  private async fetchBooking(bookingId: string) {
    this.booking = await firstValueFrom(this.appointmentsService.findBookingById(bookingId));
    this.totalPrice =
      this.booking?.services?.reduce((acc: number, s: any) => acc + s.price, 0) || 0;
  }

  public get dayjs() {
    return dayjs;
  }

  public openModalToPay() {
    console.log('Abrindo modal de pagamento...');
    alert('Funcionalidade "Pagar Agora" a ser implementada.');
  }

  public updateTotalPaid(paid: number) {
    this.totalPaid = paid;
  }

  public getTimelineStatuses(): string[] {
    return ['PENDING', 'CONFIRMED', 'COMPLETED', 'PAID'];
  }

  public isStatusComplete(status: string): boolean {
    const statuses = this.getTimelineStatuses();
    const currentStatusIndex = statuses.indexOf(this.booking?.status || '');
    const checkingStatusIndex = statuses.indexOf(status);
    return checkingStatusIndex <= currentStatusIndex;
  }

  public getStatusColor(status: string): string {
    if (this.isStatusComplete(status)) {
      return 'bg-violet-500';
    }
    return 'bg-stone-300 dark:bg-gray-700';
  }

  public getLineColor(status: string): string {
    if (this.isStatusComplete(status)) {
      return 'bg-violet-500';
    }
    return 'bg-stone-300 dark:bg-gray-700';
  }

  public getStatusIcon(status: string): string {
    if (this.isStatusComplete(status)) {
      return 'check';
    }
    switch (status) {
      case 'Agendado':
        return 'event';
      case 'Confirmado':
        return 'task_alt';
      case 'Realizado':
        return 'cut';
      case 'Pago':
        return 'paid';
      default:
        return 'hourglass_empty';
    }
  }
}
