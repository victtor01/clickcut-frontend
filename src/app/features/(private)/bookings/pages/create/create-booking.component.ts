import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Service } from '@app/core/models/Service';
import { CreateBookingDTO } from '@app/core/schemas/create-booking.dto';
import { BookingsService } from '@app/core/services/booking.service';
import { ToastService } from '@app/core/services/toast.service';
import { AllServicesComponent } from '@app/features/(private)/services/components/all-services/all-services.component';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AllTimesComponent } from '../../components/all-times/all-times.component';

dayjs.extend(customParseFormat);

@Component({
  templateUrl: './create-booking.component.html',
  imports: [AllServicesComponent, RouterLink, CommonModule, AllTimesComponent, ToFormatBrlPipe, NgOptimizedImage],
})
export class CreateBookingComponent implements OnInit {
  constructor(
    private readonly toastService: ToastService,
    private readonly bookingService: BookingsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  private _selectedServices: Service[] = [];
  private _selectedTime?: string;
  private _currentDate?: Dayjs;
  private _buttonActive: boolean = false;
  private _step: number = 1;
    
  get selectedServices() {
    return this._selectedServices;
  }

  get step(): number {
    return this._step;
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
        'minute'
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

    if (dateFromQuery) {
      this._currentDate = dayjs(dateFromQuery);
    } else {
      this._currentDate = dayjs();
    }
  }

  public activeButton(): void {
    this._buttonActive = true;
  }

  public disabledButton(): void {
    this._buttonActive = false;
  }

  public nextStep(): void {
    this._step += 1;
  }

  public backStep(): void {
    if (this._step > 1) this._step -= 0;
  }

  public submit(): void {
    switch (this._step) {
      case 1:
        if (this._selectedServices) {
          this.nextStep();
          this.disabledButton();
        } else {
          this.toastService.error('Selecione um serviço!');
        }
        break;

      case 2:
        this.createBooking();
        break;
      default:
        console.log('Operação inválida!');
    }
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
