import { CommonModule } from '@angular/common'; // Importe o CommonModule
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { BookingService } from '@app/core/services/booking.service';
import dayjs from 'dayjs'; // Importe o Dayjs

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss'], // Adicione o SCSS
  standalone: true, // Adicione standalone: true
  imports: [RouterLink, CommonModule], // Adicione CommonModule e RouterLink
})
export class BookingDetailsComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly bookingService: BookingService
  ) {}

  public bookingId: string | null = null;
  public dayjs = dayjs; // Exponha o dayjs para o template

  // Dados de exemplo para o design
  private _booking?: Booking;

  get booking() {
    return this._booking;
  }

  public ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId');

    if (this.bookingId) {
      this.bookingService.findById(this.bookingId).subscribe({
        next: (value) => {
          this._booking = value;
        },
      });
    }
  }

  public getTimelineStatuses(): BookingStatus[] {
    return ['PENDING', 'CREATED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'PAID'];
  }

  private getAllStatuses(): BookingStatus[] {
    return [
      'PENDING',
      'CREATED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'PAID',
      'CANCELLED',
      'NO_SHOW',
    ];
  }

  public isBookingTerminated(): boolean {
    if (!this.booking) return false;
    return this.booking.status === 'CANCELLED' || this.booking.status === 'NO_SHOW';
  }

  public isStatusComplete(status: BookingStatus): boolean {
    if (!this.booking || this.isBookingTerminated()) {
      return false;
    }

    const statusOrder = this.getTimelineStatuses();
    const currentStatusIndex = statusOrder.indexOf(this.booking.status);
    const checkingStatusIndex = statusOrder.indexOf(status);

    if (currentStatusIndex === -1) return false;

    return checkingStatusIndex <= currentStatusIndex;
  }

  public getLineColor(status: BookingStatus): string {
    return this.isStatusComplete(status)
      ? this.getStatusColor(status)
      : 'bg-gray-200 dark:bg-zinc-700';
  }

  public isStatusActive(status: BookingStatus): boolean {
    if (!this.booking) return false;
    const statusOrder = this.getAllStatuses();

    const currentStatusIndex = statusOrder.indexOf(this.booking.status);
    const checkingStatusIndex = statusOrder.indexOf(status);

    if (currentStatusIndex === -1) {
      return false;
    }
    return checkingStatusIndex <= currentStatusIndex;
  }

  public advanceStatus(): void {
    if (!this.booking) return;
    const statusOrder = this.getAllStatuses();
    const currentStatusIndex = statusOrder.indexOf(this.booking.status);

    if (currentStatusIndex < statusOrder.length - 1) {
      this._booking!.status = statusOrder[currentStatusIndex + 1];
      // Aqui você chamaria seu service para salvar a alteração no backend
      // this.bookingService.updateStatus(this.bookingId, this._booking.status).subscribe(...);
    }
  }

  public getStatusColor(status: BookingStatus): string {
    if (!this.isStatusComplete(status)) return 'bg-gray-400';
    return 'bg-indigo-500';
  }

  public getStatusIcon(status: BookingStatus): string {
    switch (status) {
      case 'COMPLETED':
        return 'task_alt';
      case 'IN_PROGRESS':
        return 'hourglass_top';
      case 'CONFIRMED':
        return 'event_available';
      case 'CANCELLED':
        return 'cancel';
      case 'PENDING':
        return 'pending';
      default:
        return 'radio_button_unchecked';
    }
  }
}
