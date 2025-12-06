import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { TimeSlot } from '@app/core/models/Business';
import { BookingsByDay, BookingsService } from '@app/core/services/booking.service';
import { ToastService } from '@app/core/services/toast.service';
import { UsersService } from '@app/core/services/users.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { solarArrowToTopLeftBold } from '@ng-icons/solar-icons/bold';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { firstValueFrom } from 'rxjs';
import { WeekComponent } from '../components/week/week.component';
import { DetailsBookingComponent } from './details/details-booking-modal.component';
dayjs.locale('pt-br');

type BookingFilter = 'all' | 'paid' | 'pending';

@Component({
  templateUrl: './booking.component.html',
  providers: [provideIcons({ solarArrowToTopLeftBold })],
  imports: [CommonModule, RouterLink, WeekComponent, NgIconComponent],
})
export class BookingComponent implements OnInit, OnDestroy {
  public currentDate: Dayjs = dayjs();
  public isLoading = true;
  private _bookingsByDay: BookingsByDay = {};
  private timer: any;
  public scale = 2;

  public operatingHours = signal<TimeSlot[]>([]);
  public closedIntervals = signal<{ start: number; duration: number }[]>([]);
  public showMoveTop = signal<boolean>(false);

  @ViewChild('main')
  private scheduleContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('timeIndicator')
  private timeIndicator!: ElementRef;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly bookingsService = inject(BookingsService);
  private readonly toastService = inject(ToastService);
  private readonly dialogDetails = inject(MatDialog);

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const param = params.get('curr');
      this.calculateClosedIntervals();
      if (param) {
        const day = dayjs(param, 'YYYY-MM-DD').add(20, 'hours');

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

  public moveToTop(): void {
    if (this.scheduleContainer?.nativeElement) {
      const container = this.scheduleContainer.nativeElement;

      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  public onScroll() {
    const el = this.scheduleContainer.nativeElement;

    this.showMoveTop.set(el.scrollTop !== 0);
  }

  public async ngOnInit(): Promise<void> {
    await this.fetchTimesSlots();

    this.ensureBookingsAreLoaded();

    this.timer = setInterval(() => {
      if (this.isToday) {
        this.currentDate = this.currentDate.add(30, 'second');
      }
    }, 30000);
  }

  public async fetchTimesSlots(): Promise<void> {
    try {
      const data = await firstValueFrom(this.usersService.getOperationHours());
      this.operatingHours.set(data);
      this.calculateClosedIntervals(); // Calcula para o dia inicial
    } catch (e) {
      console.error('Erro ao buscar horários', e);
    }
  }

  private calculateClosedIntervals() {
    const dayOfWeek = this.currentDate.day(); // 0 (Dom) a 6 (Sáb)

    const todaySlots = this.operatingHours().filter(
      (s) =>
        // Lida com string "1" ou number 1
        String(s.dayOfWeek) === String(dayOfWeek),
    );

    // Se não tem slots, o dia todo está fechado
    if (todaySlots.length === 0) {
      this.closedIntervals.set([{ start: 0, duration: 1440 }]); // 0h as 24h
      return;
    }

    // Ordena por horário de início
    todaySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const intervals: { start: number; duration: number }[] = [];
    let cursorMinute = 0; // Começa à meia-noite (0 min)

    // Percorre os slots de trabalho para encontrar os "buracos"
    todaySlots.forEach((slot) => {
      const startMinute = this.timeToMinutes(slot.startTime);
      const endMinute = this.timeToMinutes(slot.endTime);

      // Se há um buraco entre o cursor e o início do slot
      if (cursorMinute < startMinute) {
        intervals.push({
          start: cursorMinute,
          duration: startMinute - cursorMinute,
        });
      }

      // Atualiza o cursor para o fim deste turno de trabalho
      if (endMinute > cursorMinute) cursorMinute = endMinute;
    });

    // Buraco final (Do último turno até o fim do dia)
    if (cursorMinute < 1440) {
      intervals.push({
        start: cursorMinute,
        duration: 1440 - cursorMinute,
      });
    }

    this.closedIntervals.set(intervals);
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  public getClosedIntervalStyle(interval: { start: number; duration: number }): any {
    return {
      'grid-row': `${interval.start + 1} / span ${interval.duration}`,
      'grid-column': '1 / span 3', // Ocupa toda a largura (ou ajuste para '2' se quiser só na coluna de eventos)
    };
  }

  public onSelectDate(day: Dayjs): void {
    this.currentDate = day;
    this.setCurrentDateInUrl(this.currentDate);
    this.calculateClosedIntervals();
  }

  public activeFilter = signal<BookingFilter>('all');

  public setFilter(filter: BookingFilter): void {
    this.activeFilter.set(filter);
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
    this.calculateClosedIntervals();
  }

  public nextDay(): void {
    this.currentDate = this.currentDate.add(1, 'day');
    this.setCurrentDateInUrl(this.currentDate);
    this.calculateClosedIntervals();
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
      backdropClass: ['bg-white/60', 'dark:bg-neutral-950/60', 'backdrop-blur-sm'],
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
