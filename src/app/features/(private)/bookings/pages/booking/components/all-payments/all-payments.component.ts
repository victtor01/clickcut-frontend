import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  BookingPayment,
  BookingPaymentMethod,
  BookingPaymentStatus,
} from '@app/core/models/BookingPayment';
import { PaymentService } from '@app/core/services/payment.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';

@Component({ templateUrl: './all-payments.component.html', selector: 'all-payments', imports: [CommonModule, ToFormatBrlPipe] })
export class AllPaymentsComponent implements OnInit {
  constructor(private readonly paymentsService: PaymentService) {}

  @Input({ required: true })
  public bookingId?: string | null;

  public payments: BookingPayment[] = [];

  ngOnInit(): void {
    if (!this.bookingId) return;

    this.paymentsService.findAll(this.bookingId).subscribe({
      next: (value) => {
        console.log(value)
        this.payments = value;
      },
    });
  }

  public getPaymentMethodIcon(method: BookingPaymentMethod): string {
    switch (method) {
      case 'CASH':
        return 'local_atm';
      case 'PIX':
        return 'qr_code_2';
      case 'CREDIT_CARD':
        return 'credit_card';
      case 'DEBIT_CARD':
        return 'payment';
      default:
        return 'receipt_long';
    }
  }

  public getPaymentStatusIcon(status: BookingPaymentStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'check_circle';
      case 'PENDING':
        return 'hourglass_empty';
      case 'CANCELLED':
        return 'cancel';
      default:
        return 'help_outline';
    }
  }

  public getPaymentStatusClass(status: BookingPaymentStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'text-emerald-500 dark:text-emerald-400';
      case 'PENDING':
        return 'text-amber-500 dark:text-amber-400';
      case 'CANCELLED':
        return 'text-rose-500 dark:text-rose-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  }
}
