import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common'; // Importe o CommonModule
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { BookingService } from '@app/core/services/booking.service';
import { ToastService } from '@app/core/services/toast.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import dayjs from 'dayjs'; // Importe o Dayjs
import { AllPaymentsComponent } from './components/all-payments/all-payments.component';
import { PaymentBookingModalComponent } from './components/payment-modal/payment-booking-modal.component';

const BOOKING_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Começar agendamento',
  IN_PROGRESS: 'Finalizar agendamento',
  COMPLETED: 'Pagamento finalizado!',
};

// Texto padrão para qualquer outro status
const DEFAULT_BUTTON_LABEL = 'Avançar status';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss'], // Adicione o SCSS
  imports: [RouterLink, CommonModule, ToFormatBrlPipe, AllPaymentsComponent], // Adicione CommonModule e RouterLink
})
export class BookingDetailsComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly bookingService: BookingService,
    private readonly paymentDialog: MatDialog,
    private readonly toastService: ToastService,
    private readonly scrollStrategies: ScrollStrategyOptions
  ) {}

  public bookingId: string | null = null;
  public dayjs = dayjs;

  private _booking?: Booking;

  get booking() {
    return this._booking;
  }

  set booking(value: Booking | undefined) {
    this._booking = value;
  }

  public ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId');

    if (this.bookingId) {
      this.bookingService.findById(this.bookingId).subscribe({
        next: (value) => {
          this.booking = value;
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
    if (!this.booking?.id) return;

    const statusOrder = this.getAllStatuses();
    const currentStatusIndex = statusOrder.indexOf(this.booking.status);

    switch (this.booking.status) {
      case 'CONFIRMED':
        this.bookingService.start(this.booking.id).subscribe({
          next: (e) => {
            this._booking!.status = e.status;
          },
        });
        break;
      case 'IN_PROGRESS':
        this.bookingService.finish(this.booking.id).subscribe({
          next: (e) => {
            this._booking!.status = e.status;
          },
        });
        break;
      case 'CANCELLED':
        this.toastService.error('O Agendamento está cancelado!');
        break;
      default:
        this.toastService.error('Status inválido!');
    }

    if (currentStatusIndex < statusOrder.length - 1) {
      this._booking!.status = statusOrder[currentStatusIndex + 1];
    }
  }

  public isInConfirmed(): boolean {
    return this.booking?.status === 'CONFIRMED';
  }

  public isInProgress(): boolean {
    return this.booking?.status === 'IN_PROGRESS';
  }

  public getTextButton(): string {
    const status = this.booking?.status as BookingStatus;
    return BOOKING_STATUS_LABELS[status] || DEFAULT_BUTTON_LABEL;
  }

  public isPaid(): boolean {
    return this.booking?.status === 'PAID';
  }

  public isCompleted(): boolean {
    return this.booking?.status === 'COMPLETED';
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

  public openModalToPay() {
    const dialogRef = this.paymentDialog.open(PaymentBookingModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-zinc-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(35rem, 90%)',
      scrollStrategy: this.scrollStrategies.noop(),
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { bookingId: this.bookingId, status: this.booking?.status },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.id) {
        this.toastService.success('Pagamento registrado');
      }
    });
  }
}
