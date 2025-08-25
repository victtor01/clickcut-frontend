import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Booking } from '@app/core/models/Booking';
import {
  BookingsByDay,
  BookingService,
} from '@app/core/services/booking.service';
import { ToastService } from '@app/core/services/toast.service';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');

@Component({
  templateUrl: './booking.component.html',
  imports: [CommonModule],
})
export class BookingComponent implements OnInit {
  public currentDate: Dayjs = dayjs();
  public isLoading = true;
  private _bookingsByDay: BookingsByDay = {};

  public dayjs = dayjs;

  constructor(
    private readonly bookingsService: BookingService,
    private readonly toastService: ToastService
  ) {}

  get bookingsForCurrentDay(): Booking[] {
    const dateKey = this.currentDate.format('YYYY-MM-DD');
    return this._bookingsByDay[dateKey] || [];
  }

  get formattedDate(): string {
    return this.currentDate.format('dddd, D [de] MMMM');
  }

  ngOnInit(): void {
    this.fetchBookings();
  }

  public previousDay(): void {
    this.currentDate = this.currentDate.subtract(1, 'day');
    this.fetchBookings();
  }

  public nextDay(): void {
    this.currentDate = this.currentDate.add(1, 'day');
    this.fetchBookings();
  }

  private fetchBookings(): void {
    this.isLoading = true;
    const dateKey = this.currentDate.format('YYYY-MM-DD');
    this.bookingsService.getAll(dateKey).subscribe({
      next: (value) => {
        this._bookingsByDay = value;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Não foi possível carregar os agendamentos!');
        this.isLoading = false;
      },
    });
  }

  public getBookingGridStyle(booking: Booking): { [key: string]: any } {
    const start = dayjs(booking.startAt);
    const end = dayjs(booking.endAt);
    const startMinute = start.hour() * 60 + start.minute();
    const endMinute = end.hour() * 60 + end.minute();
    const gridRowStart = startMinute + 1;
    const gridRowEnd = endMinute + 1;

    return {
      'grid-row': `${gridRowStart} / ${gridRowEnd}`, // Ex: '571 / 616'
      'grid-column': '2', // Coloca na segunda coluna (a área de agendamentos)
    };
  }

  public openModalForHour(hour: number): void {
    const startOfHour = this.currentDate.hour(hour).minute(0).second(0);
    const endOfHour = startOfHour.add(1, 'hour');

    const bookingsInHour = this.bookingsForCurrentDay.filter((booking) => {
      const bookingStart = dayjs(booking.startAt);
      return (
        bookingStart.isAfter(startOfHour) && bookingStart.isBefore(endOfHour)
      );
    });

    console.log(`Clicou no slot das ${hour}h.`);
    console.log('Início do intervalo:', startOfHour.toISOString());
    console.log('Fim do intervalo:', endOfHour.toISOString());
    console.log('Agendamentos nesta hora:', bookingsInHour);

    alert("teste")
    // Ex: this.modalService.open(CreateBookingModal, { data: { startAt: startOfHour, bookings: bookingsInHour } });
  }
}
