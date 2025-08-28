import { Component, Input, OnInit } from '@angular/core';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import dayjs from 'dayjs';

@Component({ templateUrl: './all-times.component.html', selector: 'all-times' })
export class AllTimesComponent implements OnInit {
  constructor(
    private readonly toastService: ToastService,
    private readonly businessService: BusinessService
  ) {}

  @Input()
  public serviceId?: string;

  @Input()
  public whenSelectAction?: (time: string) => void;

  @Input()
  public selectedTime?: string;

  @Input()
  public currentDate?: string;

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
    if (this.serviceId) {
      const dateValue = this.currentDate || dayjs().format('YYYY-MM-DD');
      this.businessService.avaibleTimes(this.serviceId, dateValue).subscribe({
        next: (value: string[]) => {
          this._times = value;
        },

        error: () => {
          this.toastService.error('Não foi possível encontrar o serviço!');
        },
      });
    } else {
      this.toastService.error('Houve um erro interno, tente novamente mais tarde!');
    }
  }
}
