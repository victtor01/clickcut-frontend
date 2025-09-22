import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AvaibleTimesDTO } from '@app/core/schemas/avaible-times.dto';
import { AppointmentsService } from '@app/core/services/appointments.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { firstValueFrom } from 'rxjs';
import { AppointmentsProps } from '../../public-business.component';

dayjs.extend(utc);

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-select-date-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avaible-times.component.html',
})
export class SelectDateTimeComponent implements OnInit {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Input()
  public props?: AppointmentsProps;

  @Output()
  public onChangeDateOutput = new EventEmitter<string | null>();

  public get selectedServices() {
    return this.props?.services || [];
  }

  public totalPrice = 0;
  public totalDuration = 0;

  public currentDate: Date = new Date();
  public calendarWeeks: CalendarDay[][] = [];

  public selectedDate: Date | null = null;
  public availableTimes: string[] = [];
  public selectedTime: string | null = null;
  public isLoadingTimes = false;

  public ngOnInit(): void {
    this.setupDateTime();
    this.generateCalendar();
    this.calculateTotals();
  }

  private setupDateTime() {
    if (this.props?.date) {
    const initialDate = this.props.date.startOf('day').toDate();

    // O resto do método permanece igual.
    this.currentDate = initialDate;
    this.selectedDate = initialDate;

    this.selectedTime = this.props.date.format('HH:mm');

    this.fetchAvailableTimes(this.selectedDate);
    }
  }

  private generateCalendar(): void {
    this.calendarWeeks = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);

    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // Inicia no domingo anterior

    let currentWeek: CalendarDay[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const day: CalendarDay = {
        date: date,
        isCurrentMonth: date.getMonth() === month,
        isPast: date < today,
        isToday: date.getTime() === today.getTime(),
      };

      currentWeek.push(day);

      if (currentWeek.length === 7) {
        this.calendarWeeks.push(currentWeek);
        currentWeek = [];
      }
    }
  }

  public prevMonth(): void {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));
    this.resetSelection();
    this.generateCalendar();
  }

  public nextMonth(): void {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1));
    this.resetSelection();
    this.generateCalendar();
  }

  public async selectDay(day: CalendarDay): Promise<void> {
    if (day.isPast || !day.isCurrentMonth) {
      return;
    }

    this.selectedDate = day.date;
    this.availableTimes = [];
    this.selectedTime = null;
    this.isLoadingTimes = true;

    await this.fetchAvailableTimes(day.date);

    this.isLoadingTimes = false;
    this.changeDateTime();
  }

  public selectTime(time: string): void {
    this.selectedTime = time;
    this.changeDateTime();
  }

  private async fetchAvailableTimes(date: Date): Promise<void> {
    const day = dayjs(date);

    const fetchDTO = {
      businessId: this.props?.businessId!,
      assignedToId: this.props?.assignTo?.id!,
      serviceIds: this.selectedServices.map((s) => s.id),
      date: day.format('YYYY-MM-DD'),
    } satisfies AvaibleTimesDTO;

    const times = await firstValueFrom(this.appointmentsService.availableTimes(fetchDTO));

    this.availableTimes = times;

    this.isLoadingTimes = false;
  }

  private calculateTotals(): void {
    this.totalPrice = this.selectedServices.reduce((sum, srv) => sum + srv.price, 0);
    this.totalDuration = this.selectedServices.reduce((sum, srv) => sum + srv.durationInMinutes, 0);
  }

  private resetSelection(): void {
    this.selectedDate = null;
    this.selectedTime = null;
    this.availableTimes = [];
  }

  public changeDateTime(): void {
    if (!this.selectedDate || !this.selectedTime) {
      this.onChangeDateOutput.emit(null);
      return;
    }

    const [hour, minute] = this.selectedTime.split(':').map(Number);

    const appointmentDateTime = dayjs(this.selectedDate)
      .hour(hour)
      .minute(minute)
      .second(0)
      .millisecond(0);

    const formattedDateUTC = appointmentDateTime.utc().format();

    this.onChangeDateOutput.emit(formattedDateUTC);
  }
}
