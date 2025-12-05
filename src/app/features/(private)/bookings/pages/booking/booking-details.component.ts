import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common'; // Importe o CommonModule
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { BookingService } from '@app/core/models/BookingService';
import { UpdateBookingServiceDTO } from '@app/core/schemas/update-booking-service.dto';
import { BookingsService } from '@app/core/services/booking.service';
import { ToastService } from '@app/core/services/toast.service';
import {
  RescheduleBookingComponent,
  RescheduleBookingDialogData,
} from '@app/features/(clients)/booking/components/reschedule-booking/reschedule-booking.component';
import { bookingStatusMap } from '@app/shared/utils/booking-status';
import dayjs, { Dayjs } from 'dayjs'; // Importe o Dayjs
import { firstValueFrom } from 'rxjs';
import { AllPaymentsComponent } from './components/all-payments/all-payments.component';
import { CancelBookingComponent } from './components/cancel-booking/cancel-booking.component';
import { EditAppointmentServicesModalComponent } from './components/edit-services/edit-services.component';
import { NoShowComponent } from './components/no-show/no-show.component';
import { PaymentBookingModalComponent } from './components/payment-modal/payment-booking-modal.component';
import { ServiceModalComponent } from './components/service-modal/service-modal.component';

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
  styleUrls: ['./booking-details.component.scss'],
  imports: [RouterLink, CommonModule, AllPaymentsComponent], // Adicione CommonModule e RouterLink
})
export class BookingDetailsComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly bookingService: BookingsService,
    private readonly paymentDialog: MatDialog,
    private readonly toastService: ToastService,
    private readonly scrollStrategies: ScrollStrategyOptions,
    private readonly dialog: MatDialog,
  ) {}

  public bookingId: string | null = null;
  public openMenu: boolean = false;
  public totalPaid: number = 0;
  public dayjs = dayjs;

  private baseModal = {
    backdropClass: ['bg-white/60', 'dark:bg-gray-950/60', 'backdrop-blur-sm'],
    panelClass: ['dialog-no-container'],
    enterAnimationDuration: '300ms',
    exitAnimationDuration: '200ms',
  };

  private _booking?: Booking;

  get booking() {
    return this._booking;
  }

  get isInvalid() {
    return this?.booking?.status === 'NO_SHOW' || this?.booking?.status === 'CANCELLED';
  }

  set booking(value: Booking | undefined) {
    this._booking = value;
  }

  public ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId');

    if (this.bookingId) {
      this.fetchBooking();
    }
  }

  private async fetchBooking(): Promise<void> {
    const data = await firstValueFrom(this.bookingService.findById(this.bookingId!));
    this.booking = data;
  }

  public getTimelineStatuses(): BookingStatus[] {
    return ['PENDING', 'CREATED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'PAID'];
  }

  public legend = bookingStatusMap;

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

  public get totalPrice() {
    return (
      this._booking?.services?.reduce((curr, service) => {
        return curr + (service.price || 0);
      }, 0) || 0
    );
  }

  public updateTotalPaid = (paid: number) => {
    this.totalPaid = paid;
  };

  public get porcetagePaid() {
    if (!this.totalPrice || this.totalPrice === 0) return 0;
    return (this.totalPaid / this.totalPrice) * 100;
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

  public openService(service: BookingService): void {
    const dialogServiceModal = this.dialog.open(ServiceModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-gray-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(55rem, 90%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { service },
    });

    dialogServiceModal.afterClosed().subscribe(async (data: BookingService) => {
      if (data) {
        try {
          const updateData: UpdateBookingServiceDTO = {
            name: data.title,
            extraFee: data.extraFee,
            discount: data.discount,
            observation: data.notes,
          };

          await firstValueFrom(this.bookingService.updateService(data.id, updateData));

          this.toastService.show('Atualizado com sucesso!');
        } catch {
          this.toastService.error('Não foi possível atualizar o serviço!');
        }
      }
    });
  }

  public openAllServices(): void {
    this.dialog.open(EditAppointmentServicesModalComponent, {
      ...this.baseModal,
      maxWidth: '100rem',
      width: 'min(40rem, 100%)',
      data: {
        selectedIds: this.booking?.services?.map((s) => s.service?.id) || [],
        bookingId: this.booking?.id,
      },
    });
  }

  public get pendingBooking() {
    return this.booking?.status === "CREATED" || this.booking?.status === "PENDING" || this.booking?.status === "CONFIRMED"
  }

  public openReschedule(): void {
    const ids = this.booking?.services?.map((s) => s.serviceId)?.map((s) => String(s));

    if (!ids?.length || !this.booking?.assignedTo) return;

    const data = {
      assignedToId: this.booking?.assignedTo?.id,
      selectedDate: this.booking?.startAt,
      serviceIds: ids,
    } satisfies RescheduleBookingDialogData;

    const dialog = this.dialog.open(RescheduleBookingComponent, {
      width: 'min(30rem, 100%)',
      backdropClass: ["bg-violet-50/50", "dark:bg-black/50"],
      data,
    });

    dialog.afterClosed().subscribe(async (data: Dayjs) => {
      if (!this.booking || !data) return;

      try {
        await firstValueFrom(this.bookingService.reschedule(data.utc().toDate(), this.booking.id));
        await this.fetchBooking();

        this.toastService.success('Remarcado com sucesso!');
      } catch (ex) {
        let message = 'Houve um erro interno!';

        if (ex instanceof HttpErrorResponse) {
          message = ex.error.message;
        }

        this.toastService.error(message);
      }
    });
  }

  public handleEdit(): void {
    this.openMenu = !this.openMenu;
  }

  public getLineColor(status: BookingStatus): string {
    return this.isStatusComplete(status)
      ? this.getStatusColor(status)
      : 'bg-stone-200 dark:bg-gray-700';
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
    if (!this.isStatusComplete(status)) return 'bg-gray-400 dark:bg-gray-800';
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

  public openModalToPay(): void {
    const dialogRef = this.paymentDialog.open(PaymentBookingModalComponent, {
      ...this.baseModal,
      maxWidth: '100rem',
      width: 'min(35rem, 90%)',
      scrollStrategy: this.scrollStrategies.noop(),
      data: { bookingId: this.bookingId, status: this.booking?.status },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.id) {
        this.toastService.success('Pagamento registrado');
      }
    });
  }

  public openCancel(): void {
    this.dialog.open(CancelBookingComponent, {
      ...this.baseModal,
      maxWidth: '35rem',
      width: 'min(35rem, 100%)',
      data: { bookingId: this.booking?.id },
    });
  }

  public openNoShow(): void {
    this.dialog.open(NoShowComponent, {
      ...this.baseModal,
      maxWidth: '35rem',
      width: 'min(35rem, 100%)',
      data: { bookingId: this.booking?.id },
    });
  }
}
