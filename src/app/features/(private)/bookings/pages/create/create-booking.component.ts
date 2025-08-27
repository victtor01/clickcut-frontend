import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Service } from '@app/core/models/Service';
import { ToastService } from '@app/core/services/toast.service';
import { AllServicesComponent } from '@app/features/(private)/services/components/all-services/all-services.component';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AllTimesComponent } from '../../components/all-times/all-times.component';

dayjs.extend(customParseFormat);

@Component({
  templateUrl: './create-booking.component.html',
  imports: [AllServicesComponent, RouterLink, CommonModule, AllTimesComponent, ToFormatBrlPipe],
})
export class CreateBookingComponent {
  constructor(private readonly toastService: ToastService) {}

  private _selectedService?: Service;
  private _selectedTime?: string;
  private _buttonActive: boolean = false;
  private _step: number = 1;

  get selectedService() {
    return this._selectedService;
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
    if (this._selectedTime && this._selectedService?.durationInMinutes) {
      const startTime = dayjs(this._selectedTime, 'HH:mm');
      const endTime = startTime.add(this._selectedService.durationInMinutes, 'minute');
      return endTime.format('HH:mm');
    }
  }

  get serviceId(): string | undefined {
    return this._selectedService?.id;
  }

  get selectedTime(): string | undefined {
    return this._selectedTime;
  }

  get buttonActive(): boolean {
    return this._buttonActive;
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

  public submit() {
    switch (this._step) {
      case 1:
        if (this._selectedService) {
          this.nextStep();
          this.disabledButton();
        } else {
          this.toastService.error('Selecione um serviço!');
        }
        break;
      default:
        console.log('Operação inválida!');
    }
  }

  public selectTime = (time: string): void => {
    this._selectedTime = time;
    this.activeButton();
  };

  public isActive = (service: Service) => {
    return service?.id == this._selectedService?.id;
  };

  public selectItem = (service: Service) => {
    this._selectedService = service;
    this.activeButton();
  };
}
