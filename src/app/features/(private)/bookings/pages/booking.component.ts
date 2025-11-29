import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { BookingsByDay, BookingsService } from '@app/core/services/booking.service';
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

  @ViewChild('main')
  private scheduleContainer!: ElementRef<HTMLDivElement>; // Referência ao DIV pai

  @ViewChild('timeIndicator')
  private timeIndicator!: ElementRef;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly bookingsService = inject(BookingsService);
  private readonly toastService = inject(ToastService);
  private readonly dialogDetails = inject(MatDialog);

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const param = params.get('curr');

      if (param) {
        const day = dayjs(param, 'YYYY-MM-DD').add(20, "hours");

        if (day.isValid()) {
          this.currentDate = day;
        }
      }
    });
  }

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

  public onSelectDate(day: Dayjs): void {
    this.currentDate = day;
    this.setCurrentDateInUrl(this.currentDate);
  }

  public activeFilter = signal<BookingFilter>('all');

  public setFilter(filter: BookingFilter): void {
    this.activeFilter.set(filter);
    console.log('Filtro ativo:', this.activeFilter());
  }

  private ensureBookingsAreLoaded(date?: string): void {
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
    this.setCurrentDateInUrl(this.currentDate);
    this.ensureBookingsAreLoaded();
  }

  public nextDay(): void {
    this.currentDate = this.currentDate.add(1, 'day');
    this.setCurrentDateInUrl(this.currentDate);
    this.ensureBookingsAreLoaded();
  }

  private setCurrentDateInUrl(currentDate: Dayjs) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { curr: currentDate.format('YYYY-MM-DD') },
      queryParamsHandling: 'merge',
    });
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

    const startOfWeek = date.startOf('month');
    const endOfWeek = date.endOf('month');

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
    // Verifica se é hoje e se o indicador e o contêiner foram renderizados
    if (
      this.isToday &&
      this.timeIndicator?.nativeElement &&
      this.scheduleContainer?.nativeElement
    ) {
      const indicatorElement = this.timeIndicator.nativeElement;
      const containerElement = this.scheduleContainer.nativeElement;

      // Calcula a posição do indicador dentro do contêiner scrollável
      const indicatorPosition = indicatorElement.offsetTop;

      // Calcula o meio da tela do contêiner para centralizar a rolagem
      const offset = containerElement.clientHeight / 2;

      // Define a nova posição de rolagem do contêiner
      containerElement.scrollTop = indicatorPosition - offset;
    } else if (this.timeIndicator?.nativeElement) {
      // Fallback se o contêiner scrollável não for encontrado, mas o alvo sim
      this.timeIndicator.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const dailyBookings: Booking[] = this._bookingsByDay[dayjs(date).format('YYYY-MM-DD')] || [];

    const dialogRef = this.dialogDetails.open(DetailsBookingComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-stone-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(60rem, 90%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { bookings: dailyBookings, initialDate: date },
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
