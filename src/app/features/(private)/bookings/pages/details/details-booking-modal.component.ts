import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import dayjs from 'dayjs';

export interface DialogData {
  bookings: Booking[];
}

@Component({ templateUrl: './details-booking-modal.component.html', imports: [DatePipe, RouterLink] })
export class DetailsBookingComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailsBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.bookings = data?.bookings || [];
  }

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
}
