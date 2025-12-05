import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Booking } from '@app/core/models/Booking';
import { TimeSlot } from '@app/core/models/Business';
import { Service } from '@app/core/models/Service';
import { CreateBookingDTO } from '@app/core/schemas/create-booking.dto';
import { BookingsService } from '@app/core/services/booking.service';
import { BookingsByDay } from '@app/core/services/clients-account.service';
import { ToastService } from '@app/core/services/toast.service';
import { UsersService } from '@app/core/services/users.service';
import { AllServicesComponent } from '@app/features/(private)/services/components/all-services/all-services.component';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { firstValueFrom } from 'rxjs';
import { AllTimesComponent } from '../../components/all-times/all-times.component';

dayjs.extend(customParseFormat);

@Component({
  templateUrl: './create-booking.component.html',
  imports: [
    AllServicesComponent,
    RouterLink,
    CommonModule,
    AllTimesComponent,
    NgOptimizedImage,
  ],
})
export class CreateBookingComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly bookingService = inject(BookingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);

  private _selectedServices: Service[] = [];
  private _selectedTime?: string;
  private _currentDate?: Dayjs;
  private _buttonActive: boolean = false;

  public timesOfBusiness = signal<TimeSlot[]>([]);
  public bookingsToDay = signal<Booking[]>([]);

  get selectedServices() {
    return this._selectedServices;
  }

  get selectedServiceIds() {
    return this._selectedServices.map((s) => s.id);
  }

  get timeStart(): string | void {
    if (this._selectedTime) {
      return this._selectedTime;
    }
  }

  get timeEnd(): string | void {
    if (this._selectedTime) {
      const startTime = dayjs(this._selectedTime, 'HH:mm');

      const endTime = startTime.add(
        this._selectedServices.reduce((curr, value) => curr + value.durationInMinutes, 0),
        'minute',
      );

      return endTime.format('HH:mm');
    }
  }

  get serviceIds(): string[] | undefined {
    return this._selectedServices?.map((s) => s.id);
  }

  get selectedTime(): string | undefined {
    return this._selectedTime;
  }

  get buttonActive(): boolean {
    return this._buttonActive;
  }

  get currentDate() {
    return this._currentDate;
  }

  ngOnInit(): void {
    const dateFromQuery = this.route.snapshot.queryParamMap.get('currentDate');

    this._currentDate = dateFromQuery ? dayjs(dateFromQuery) : dayjs();

    this.fetchBookingsToDay();
    this.fetchTimesSlots();
  }

  public activeButton(): void {
    this._buttonActive = true;
  }

  public disabledButton(): void {
    this._buttonActive = false;
  }

  public submit(): void {
    this.createBooking();
  }

  public async fetchTimesSlots(): Promise<void> {
    const data = await firstValueFrom(this.usersService.getOperationHours());

    this.timesOfBusiness.set(data);
  }

  public async fetchBookingsToDay(): Promise<void> {
    const today = dayjs();

    const data: BookingsByDay = await firstValueFrom(this.bookingService.getAll(today, today));

    const bookingsFormated: Booking[] = Object.entries(data)
      .map(([_, bookings]) => bookings).flat();

    this.bookingsToDay.set(bookingsFormated);
  }

  public createBooking(): void {
    if (!this.serviceIds || !this._selectedTime || !this._currentDate) {
      this.toastService.error('Dados faltando');
      return;
    }

    const [hours, minutes] = this._selectedTime.split(':').map(Number);
    const bookingDayjsObject = this._currentDate
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0);

    const createBookingDTO = {
      title: '',
      serviceId: this.serviceIds,
      startAt: bookingDayjsObject.toDate().toISOString(),
    } satisfies CreateBookingDTO;

    this.bookingService.create(createBookingDTO).subscribe({
      next: (data) => {
        this.toastService.success(`Agendamento criado as ${this._selectedTime}`);
        this.router.navigate(['/bookings']);
      },

      error: (err) => {
        this.toastService.error(err?.error?.message || 'Houve um erro interno!', 5000);
        console.log(err);
      },
    });
  }

  public selectTime = (time: string): void => {
    this._selectedTime = time;
    this.activeButton();
  };

  public isActive = (service: Service) => {
    return this._selectedServices?.map((s) => s.id)?.includes(service.id);
  };

  public selectItem = (service: Service) => {
    const exists: Service[] = this._selectedServices?.filter((s) => s.id == service.id) || [];

    if (exists?.length) {
      this._selectedServices = [...this._selectedServices.filter((s) => s.id !== service.id)];
    } else {
      this._selectedServices = [...this._selectedServices, service];
    }

    this.activeButton();
  };
}
