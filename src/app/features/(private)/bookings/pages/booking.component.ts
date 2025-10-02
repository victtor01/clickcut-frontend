import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { BookingsByDay, BookingService } from '@app/core/services/booking.service';
import { ToastService } from '@app/core/services/toast.service';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { WeekComponent } from '../components/week/week.component';
import { DetailsBookingComponent } from './details/details-booking-modal.component';
dayjs.locale('pt-br');

type BookingFilter = 'all' | 'paid' | 'pending';

@Component({
  templateUrl: './booking.component.html',
  imports: [CommonModule, RouterLink, WeekComponent],
})
export class BookingComponent implements OnInit, OnDestroy {
  public currentDate: Dayjs = dayjs();
  public isLoading = true;
  private _bookingsByDay: BookingsByDay = {};
  private timer: any;
  public scale = 2;

  @ViewChild('timeIndicator')
  private timeIndicator!: ElementRef;

  constructor(
    private readonly bookingsService: BookingService,
    private readonly toastService: ToastService,
    private readonly dialogDetails: MatDialog,
  ) {}

  get day() {
    return dayjs;
  }

  get bookingsForCurrentDay(): Booking[] {
    const dateKey = this.currentDate.format('YYYY-MM-DD');
    return this._bookingsByDay[dateKey] || [];
  }

  get timelineGridStyle(): { [key: string]: string } {
    return {
      'grid-template-rows': `repeat(1440, ${this.scale}px)`,
    };
  }

  get formattedDate(): string {
    return this.currentDate.format('dddd, D [de] MMMM');
  }

  public ngOnInit(): void {
    this.ensureBookingsAreLoaded();

    this.timer = setInterval(() => {
      if (this.isToday) {
        this.currentDate = this.currentDate.add(30, 'second');
      }
    }, 30000);
  }

  public activeFilter = signal<BookingFilter>('all');

  // Método para atualizar o filtro quando um botão é clicado
  public setFilter(filter: BookingFilter): void {
    this.activeFilter.set(filter);
    //
    // AQUI você adicionaria a lógica para recarregar ou filtrar sua lista de agendamentos
    // Ex: this.loadBookings(filter);
    //
    console.log('Filtro ativo:', this.activeFilter());
  }

  private ensureBookingsAreLoaded(): void {
    const dateKey = this.currentDate.format('YYYY-MM-DD');

    if (this._bookingsByDay[dateKey]) {
      setTimeout(() => this.scrollToCurrentTime(), 0);
      return;
    }

    this.fetchBookingsForWeek(this.currentDate);
  }

  public ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
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

  public previousDay(): void {
    this.currentDate = this.currentDate.subtract(1, 'day');
    this.ensureBookingsAreLoaded();
  }

  public nextDay(): void {
    this.currentDate = this.currentDate.add(1, 'day');
    this.ensureBookingsAreLoaded();
  }

  get currentTimeIndicatorStyle(): { [key: string]: any } {
    const minutesFromMidnight = this.currentDate.hour() * 60 + this.currentDate.minute();
    return {
      'grid-row-start': `${minutesFromMidnight + 1}`,
    };
  }

  get isToday(): boolean {
    return this.currentDate.isSame(dayjs(), 'day');
  }

  private fetchBookingsForWeek(date: Dayjs): void {
    this.isLoading = true;

    const startOfWeek = date.startOf('week').format('YYYY-MM-DD');
    const endOfWeek = date.endOf('week').format('YYYY-MM-DD');

    this.bookingsService.getAll(startOfWeek, endOfWeek).subscribe({
      next: (newBookings) => {
        this._bookingsByDay = { ...this._bookingsByDay, ...newBookings };
        this.isLoading = false;

        setTimeout(() => {
          this.scrollToCurrentTime();
        }, 0);
      },
      error: () => {
        this.toastService.error('Não foi possível carregar os agendamentos!');
        this.isLoading = false;
      },
    });
  }

  get countOfDates(): Record<string, number> {
    if (this._bookingsByDay) {
      return Object.entries(this._bookingsByDay).reduce(
        (acc, [key, value]) => {
          acc[key] = value?.length || 0;
          return acc;
        },
        {} as Record<string, number>,
      );
    }

    return {};
  }

  private scrollToCurrentTime(): void {
    if (this.isToday && this.timeIndicator?.nativeElement) {
      this.timeIndicator.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  public getBookingGridStyle(booking: Booking): { [key: string]: any } {
    const start = dayjs(booking.startAt);
    const end = dayjs(booking.endAt);
    const startMinute = start.hour() * 60 + start.minute();
    const endMinute = end.hour() * 60 + end.minute();
    return {
      'grid-row': `${startMinute + 1} / ${endMinute + 1}`,
      'grid-column': '2',
    };
  }

  public openModalForHour(date: Date): void {
    const dateInUTC = dayjs(date).utc();
    const startOfHour = dateInUTC.startOf('hour');
    const startOfNextHour = startOfHour.add(1, 'hour');

    const bookings: Booking[] = this._bookingsByDay[dayjs(date).format('YYYY-MM-DD')] || [];

    const bookingsInHour = bookings.filter((booking) => {
      const bookingStartAtUTC = dayjs(booking.startAt);

      const isAfterOrOnStart =
        bookingStartAtUTC.isAfter(startOfHour) || bookingStartAtUTC.isSame(startOfHour);
      const isBeforeNextHour = bookingStartAtUTC.isBefore(startOfNextHour);

      return isAfterOrOnStart && isBeforeNextHour;
    });

    const dialogRef = this.dialogDetails.open(DetailsBookingComponent, {
      width: 'min(50rem, 90%)',
      backdropClass: ['bg-transparent', 'dark:bg-zinc-950/10', 'backdrop-blur-lg'],
      panelClass: 'dialog-no-container',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { bookings: bookingsInHour },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
    });
  }

  public hourToDay(hour: number) {
  return this.currentDate.hour(hour).minute(0).second(0).toDate();
  }

  public isNow() {
    return this.currentDate.isSame(dayjs(), 'date');
  }

  public navigateToNow() {
    if (!this.isNow()) {
      this.currentDate = dayjs();
      this.ensureBookingsAreLoaded();
    }
  }
}
