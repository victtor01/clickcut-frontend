import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingPayment } from '@app/core/models/BookingPayment';
import { PaymentService } from '@app/core/services/payment.service';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({ templateUrl: './payment-booking-modal.component.html', imports: [CommonModule, QRCodeComponent] })
export class PaymentBookingModalComponent implements OnInit {
  constructor(
    private readonly dialogRef: MatDialogRef<PaymentBookingModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: { bookingId: string },
    private readonly paymentsService: PaymentService
  ) {}

  public payment?: BookingPayment;

  public ngOnInit(): void {
    if (this.data?.bookingId) {
      this.paymentsService.paymentIntent(this.data.bookingId).subscribe({
        next: (value) => {
          console.log('valor: ', value);
          this.payment = value;
        },
      });
    }
  }

  public get pixCopyPasteCode() {
    return this.payment?.copyPasteCode;
  }
  
  public get base64() {
    return this.payment?.qrCodeBase64 || null;
  }

  public isCopied = false;

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
    textArea.value = this.pixCopyPasteCode || "";

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
