import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Booking } from '@app/core/models/Booking';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { ToastService } from '@app/core/services/toast.service';
import { SvgFinishComponent } from '@app/shared/components/finish-svg/finish-svg.component';
import { firstValueFrom } from 'rxjs';
import { SvgSendEmail } from './components/svg-send-email/svg-send-email.component';

@Component({
  selector: 'app-validate-booking',
  templateUrl: 'validate-booking.component.html',
  standalone: true,
  imports: [SvgSendEmail, CommonModule, SvgFinishComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidateBookingComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly routerActivated = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  public booking?: Booking;
  public error: string | null = null;
  public validationCode = signal('');
  public isRequestingCode = false;
  public isVerifyingCode = false;
  public codeSent = false;
  public isConfirmed = false;
  public isPaid = false;

  public ngOnInit(): void {
    this.routerActivated.params.subscribe((params) => {
      const bookingId = params['bookingId'];

      if (bookingId) {
        this.fetchBooking(bookingId);
      } else {
        this.error = 'ID do agendamento não fornecido.';
        this.cdr.markForCheck();
      }
    });

    this.routerActivated.queryParams.subscribe((params) => {
      const status = params['status'];

      if (status === 'sended') {
        this.codeSent = true;
        this.cdr.markForCheck();
      }
    });
  }

  private async fetchBooking(bookingId: string): Promise<void> {
    try {
      this.booking = await firstValueFrom(this.appointmentsService.findBookingById(bookingId));

      if (!this.booking) {
        this.error = 'Agendamento não encontrado.';
      }

      if (this.booking.status == 'CONFIRMED') {
        this.isConfirmed = true;
      }

      if(this.booking.status == "PAID") {
        this.isPaid = true;
      }

    } catch (err) {
      this.error = 'Ocorreu um erro ao buscar os detalhes do agendamento.';
      this.toastService.error('Falha ao carregar agendamento.');
    } finally {
      this.cdr.markForCheck();
    }
  }

  public async requestValidationCode(): Promise<void> {
    if (!this.booking) return;

    this.isRequestingCode = true;
    this.cdr.markForCheck();

    try {
      await firstValueFrom(this.appointmentsService.sendCode(this.booking.id));
      this.toastService.success('Código enviado para seu e-mail!');
      this.codeSent = true;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.toastService.error(err.error?.message || 'Código não enviado!');
      }
    } finally {
      this.isRequestingCode = false;
      this.cdr.markForCheck();
    }
  }

  public onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    this.validationCode.set(value);
  }

  public async verifyCode(): Promise<void> {
    if (this.validationCode().length !== 6) return;

    if (!this.booking?.id) {
      return;
    }

    this.isVerifyingCode = true;
    this.cdr.markForCheck();

    try {
      const validate = await firstValueFrom(
        this.appointmentsService.confirmAppointment(this.booking.id, this.validationCode()),
      );

      if (validate.id) {
        this.isConfirmed = true;
      }
    } catch (err) {
      const message = err instanceof HttpErrorResponse ? err?.error?.message : 'Erro desconhecido!';
      this.toastService.error(message);
    } finally {
      this.isVerifyingCode = false;
      this.validationCode.set('');
      this.cdr.markForCheck();
    }
  }
}
