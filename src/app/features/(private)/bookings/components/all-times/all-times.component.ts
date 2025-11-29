import { Component, inject, Input, OnInit } from '@angular/core';
import { AvaibleTimesDTO } from '@app/core/schemas/avaible-times.dto';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import dayjs from 'dayjs';

type SearchTimeDTO = {
  assignedToId?: string;
  businessId?: string;
};

@Component({ templateUrl: './all-times.component.html', selector: 'all-times' })
export class AllTimesComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly businessService = inject(BusinessService);
  private readonly appointmentsService = inject(AppointmentsService);

  @Input()
  public serviceIds?: string[];

  @Input()
  public booking?: SearchTimeDTO;

  @Input()
  public selectedTime?: string | null;

  @Input()
  public currentDate?: string;

  @Input()
  public whenSelectAction?: (time: string) => void;

  private _times: string[] = [];

  get times() {
    return this._times;
  }

  public ngOnInit(): void {
    this.loadTimes();
  }

  public onClick(time: string): void {
    if (this.whenSelectAction) {
      this.whenSelectAction(time);
    }
  }

  private loadTimes() {
    if (!this.serviceIds || !this.currentDate) {
      this.toastService.error('Houve um erro interno, tente novamente mais tarde!');
      return;
    }

    const dateValue = this.currentDate || dayjs().format('YYYY-MM-DD');

    if (this.booking?.businessId && this.booking.assignedToId) {
      const data = {
        serviceIds: this.serviceIds,
        businessId: this.booking.businessId,
        assignedToId: this.booking.assignedToId,
        date: this.currentDate,
      } satisfies AvaibleTimesDTO;

      this.appointmentsService.availableTimes(data).subscribe({
        next: (data) => {
          this._times = data;
        },
      });
    } else {
      this.businessService.avaibleTimes(this.serviceIds, dateValue).subscribe({
        next: (value: string[]) => {
          this._times = value;
        },

        error: () => {
          this.toastService.error('Não foi possível encontrar o serviço!');
        },
      });
    }
  }
}
