import { animate, group, query, stagger, style, transition, trigger } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { bookingStatusMap } from '@app/shared/utils/booking-status';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export interface DialogData {
  bookings: Booking[];
  initialDate: Date;
}

@Component({
  templateUrl: './details-booking-modal.component.html',
  imports: [DatePipe, RouterLink, CommonModule],
  animations: [
    trigger('listAnimation', [
      transition(':increment', [
        style({ position: 'relative' }),
        group([
          query(
            ':leave',
            [
              style({ position: 'absolute', left: 0, right: 0, width: '100%' }),
              stagger('50ms', [
                animate(
                  '100ms ease-in-out',
                  style({
                    opacity: 0,
                    transform: 'translateY(40px)', // Itens saem para baixo
                  }),
                ),
              ]),
            ],
            { optional: true },
          ),

          query(
            ':enter',
            [
              style({ opacity: 0, transform: 'translateY(-40px)' }), // Itens entram de cima
              stagger('50ms', [
                animate(
                  '300ms ease-in-out',
                  style({
                    opacity: 1,
                    transform: 'translateY(0)',
                  }),
                ),
              ]),
            ],
            { optional: true },
          ),
        ]),
      ]),

      transition(':decrement', [
        style({ position: 'relative' }),
        // Executa as animações de entrada e saída EM PARALELO
        group([
          query(
            ':leave',
            [
              // Adicionado width: '100%' para evitar que o item encolha
              style({ position: 'absolute', left: 0, right: 0, width: '100%' }),
              stagger('50ms', [
                animate(
                  '300ms ease-in-out',
                  style({
                    opacity: 0,
                    transform: 'translateY(-20px)', // Itens saem para cima
                  }),
                ),
              ]),
            ],
            { optional: true },
          ),

          query(
            ':enter',
            [
              style({ opacity: 0, transform: 'translateY(20px)'}), // Itens entram de baixo
              stagger('50ms', [
                animate(
                  '300ms ease-in-out',
                  style({
                    opacity: 1,
                    transform: 'translateY(0)',
                  }),
                ),
              ]),
            ],
            { optional: true },
          ),
        ]),
      ]),
    ]),
  ],
})
export class DetailsBookingComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DetailsBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  public currentHour!: dayjs.Dayjs;

  ngOnInit(): void {
    // this.bookings = this.data.bookings || [];
    this.currentHour = dayjs(this.data.initialDate);
    this.filterBookingsForCurrentHour();
  }

  public statusMap = bookingStatusMap;

  public bookings?: Booking[];

  public close() {
    this.dialogRef.close();
  }

  public isLate(booking: Booking) {
    const now = dayjs();
    const startDate = dayjs(booking.startAt);
    const invalidStatus: BookingStatus[] = ['CREATED', 'CONFIRMED'];

    if (startDate.isValid()) {
      return now.isAfter(startDate) && invalidStatus.includes(booking.status);
    }

    return false;
  }

  public trackByBookingId(index: number, booking: Booking): string {
    return booking.id;
  }

  private filterBookingsForCurrentHour(): void {
    const startOfHour = this.currentHour.startOf('hour');
    const endOfHour = this.currentHour.endOf('hour');

    this.bookings = this.data.bookings.filter((booking) => {
      const bookingStartAt = dayjs(booking.startAt);
      return bookingStartAt.isBetween(startOfHour, endOfHour, null, '[]'); // '[]' inclui o início e o fim
    });
  }

  public nextHour(): void {
    this.currentHour = this.currentHour.add(1, 'hour');
    this.filterBookingsForCurrentHour();
  }

  /**
   * Navega para a hora anterior e atualiza a lista de agendamentos.
   */
  public previousHour(): void {
    this.currentHour = this.currentHour.subtract(1, 'hour');
    this.filterBookingsForCurrentHour();
  }
}
