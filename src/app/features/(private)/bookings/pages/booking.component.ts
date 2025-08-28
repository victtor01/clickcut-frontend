import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '@app/core/models/Booking';
import { BookingsByDay, BookingService } from '@app/core/services/booking.service';
import { ToastService } from '@app/core/services/toast.service';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { DetailsBookingComponent } from './details/details-booking-modal.component';
dayjs.locale('pt-br');

@Component({
  templateUrl: './booking.component.html',
  imports: [CommonModule, RouterLink],
})
export class BookingComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentDate: Dayjs = dayjs();
  public isLoading = true;
  private _bookingsByDay: BookingsByDay = {};
  private timer: any;
  public dayjs = dayjs;
  public scale = 2;

  @ViewChild('timeIndicator')
  private timeIndicator!: ElementRef;

  constructor(
    private readonly bookingsService: BookingService,
    private readonly toastService: ToastService,
    private readonly dialogDetails: MatDialog
  ) {}

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
    this.fetchBookings();

    this.timer = setInterval(() => {
      this.currentDate = this.currentDate.add(30, 'second');
    }, 30000);
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

  public ngAfterViewInit(): void {
    this.scrollToCurrentTime();
  }

  public previousDay(): void {
    this.currentDate = this.currentDate.subtract(1, 'day');
    this.fetchBookings();
  }

  public nextDay(): void {
    this.currentDate = this.currentDate.add(1, 'day');
    this.fetchBookings();
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

  private scrollToCurrentTime(): void {
    if (this.isToday && this.timeIndicator?.nativeElement) {
      this.timeIndicator.nativeElement.scrollIntoView({
        behavior: 'smooth', // Rolagem suave
        block: 'center', // Centraliza o elemento na tela
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

  public onGridClick(hour: string) {
    alert(hour);
  }

  public openModalForHour(date: Date): void {
    const dateFormated = dayjs(date);

    const bookings: Booking[] = this._bookingsByDay[dateFormated.format('YYYY-MM-DD')];

    const start = dateFormated.startOf('hour').subtract(1, 'minute');
    const end = dateFormated.endOf('hour').add(1, 'minute');

    const bookingsInHour = bookings.filter((booking) => {
      return dayjs(booking.startAt).isAfter(start) && dayjs(booking.endAt).isBefore(end);
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
}
