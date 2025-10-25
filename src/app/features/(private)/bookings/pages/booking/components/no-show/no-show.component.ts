import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingsService } from '@app/core/services/booking.service';
import { ToastService } from '@app/core/services/toast.service';
import { firstValueFrom, interval, take } from 'rxjs';
import { CancelBookingComponent } from '../cancel-booking/cancel-booking.component';

@Component({ templateUrl: './no-show.component.html' })
export class NoShowComponent {
  public secounds = 5;

  private readonly bookingService = inject(BookingsService);
  private readonly toastService = inject(ToastService);
  private readonly modal = inject(MatDialogRef<CancelBookingComponent>);

  private readonly data = inject<{ bookingId: string }>(MAT_DIALOG_DATA);

  public get done() {
    return this.secounds <= 0;
  }

  public ngOnInit(): void {
    interval(1000)
      .pipe(take(this.secounds + 1))
      .subscribe((_) => {
        this.secounds = this.secounds - 1;
      });
  }

  public async cancel(): Promise<void> {
    if (this.data.bookingId) {
      await firstValueFrom(this.bookingService.noShow(this.data.bookingId))
        .then(() => {
          this.toastService.success('Agendamento cancelado!');
          this.modal.close();
        })
        .catch((err) =>
          this.toastService.error(
            err?.error?.message ||
              'Houve um erro ao tentar cancelar, entre em contato com suporte!',
          ),
        );
    }
  }
}
