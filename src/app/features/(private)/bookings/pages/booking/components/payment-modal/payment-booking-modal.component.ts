import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingStatus } from '@app/core/models/Booking';
import { BookingPayment } from '@app/core/models/BookingPayment';
import { CreateManualPaymentDTO } from '@app/core/schemas/create-manual-payment.dto';
import { InvalidationService } from '@app/core/services/invalidation.service';
import { PaymentService } from '@app/core/services/payment.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'; // Importar o plugin de duração
import { ManualPaymentComponent } from '../manual-payment/manual-payment.component';

dayjs.extend(duration);

@Component({
  templateUrl: './payment-booking-modal.component.html',
  imports: [CommonModule, ToFormatBrlPipe, ReactiveFormsModule, ManualPaymentComponent],
})
export class PaymentBookingModalComponent implements OnInit, OnDestroy {
  constructor(
    private readonly dialogRef: MatDialogRef<PaymentBookingModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: { bookingId: string; status: BookingStatus },
    private readonly paymentsService: PaymentService,
    private readonly invalidationService: InvalidationService
  ) {}

  private timerInterval?: any;

  public pendingValue?: number;
  public payment?: BookingPayment;
  public time = dayjs();

  public activeTab: string = 'manual';
  public remainingTime: string = '00:00';
  public isExpired: boolean = false;
  public isLoading: boolean = true;
  public isCopied: boolean = false;
  public isPixLoading: boolean = true;

  public selectedPaymentMethod: string = 'dinheiro';

  public ngOnInit(): void {
    if (this?.data?.status !== 'COMPLETED') return;

    if (this.data?.bookingId) {
      if (this.activeTab === 'pix') {
        this.paymentsService.paymentIntent(this.data.bookingId).subscribe({
          next: (value) => {
            this.payment = value;
            this.startCountdown();
          },
        });
      }

      this.paymentsService.getPendingBalance(this.data.bookingId).subscribe({
        next: (value) => {
          this.pendingValue = value.pending;
        },
      });
    }

    this.timerInterval = setInterval(() => {}, 1000);
  }

  public ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  public selectTab(tab: 'manual' | 'pix'): void {
    this.activeTab = tab;
    if (this.activeTab === 'pix') {
      this.fetchPixPaymentIntent();
    }
  }

  public createManualPayment(props: Partial<CreateManualPaymentDTO>) {
    if (!props.amount || !props.method) {
      return;
    }

    const createBookingDTO: CreateManualPaymentDTO = {
      bookingId: this.data.bookingId,
      method: props.method,
      amount: props.amount,
    };

    this.paymentsService.createManual(createBookingDTO).subscribe({
      next: (value) => {
        this.invalidationService.invalidate(this.invalidationService.INVALIDATE_KEYS.service);
        this.dialogRef.close(value);
      },
    });
  }

  private fetchPixPaymentIntent(): void {
    if (!this.data?.bookingId) return;

    this.isPixLoading = true;
    this.payment = undefined;

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.paymentsService.paymentIntent(this.data.bookingId).subscribe({
      next: (value) => {
        this.payment = value;
        this.startCountdown();
        this.isPixLoading = false;
      },
      error: () => {
        this.isPixLoading = false;
      },
    });
  }

  private startCountdown(): void {
    if (!this.payment?.expirationDate) return;

    this.timerInterval = setInterval(() => {
      const expirationDate = dayjs(this.payment!.expirationDate);
      const now = dayjs();

      if (now.isAfter(expirationDate)) {
        this.remainingTime = '00:00';
        this.isExpired = true;
        clearInterval(this.timerInterval);
        return;
      }

      const diff = expirationDate.diff(now);
      const remainingDuration = dayjs.duration(diff);

      const minutes = remainingDuration.minutes().toString().padStart(2, '0');
      const seconds = remainingDuration.seconds().toString().padStart(2, '0');

      this.remainingTime = `${minutes}:${seconds}`;
    }, 1000);
  }

  public get pixCopyPasteCode() {
    return this.payment?.copyPasteCode;
  }

  public get status() {
    return this.data.status;
  }

  public get base64() {
    return this.payment?.qrCodeBase64 || null;
  }

  public copyCode = () => {
    if (!this.pixCopyPasteCode) return;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(this.pixCopyPasteCode)
        .then(() => {
          this.showCopiedFeedback();
        })
        .catch((err) => {
          console.error('Falha ao copiar com a API moderna: ', err);
          this.copyLegacy();
        });
    } else {
      this.copyLegacy();
    }

    this.isCopied = true;

    setTimeout(() => {
      this.isCopied = false;
    }, 5000);
  };

  public close() {
    this.dialogRef.close();
  }

  private copyLegacy() {
    const textArea = document.createElement('textarea');
    textArea.value = this.pixCopyPasteCode || '';

    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showCopiedFeedback();
      } else {
        console.error('Falha ao copiar com o método antigo.');
      }
    } catch (err) {
      console.error('Erro ao tentar copiar com o método antigo: ', err);
    }

    document.body.removeChild(textArea);
  }

  private showCopiedFeedback() {
    this.isCopied = true;
    setTimeout(() => {
      this.isCopied = false;
    }, 2000);
  }
}
