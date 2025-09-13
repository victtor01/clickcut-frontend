import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Business, TimeSlot } from '@app/core/models/Business';
import { BusinessService } from '@app/core/services/business.service';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';
import { CustomSliderComponent } from './components/custom-slider/custom-slider.component';
import { ShowTimeSlotsComponent } from './components/show-time-slots/show-time-slots.component';

export interface WeeklySchedule {
  [day: number]: {
    isActive: boolean;
    slots: TimeSlot[];
  };
}

@Component({
  templateUrl: 'configure-business.component.html',
  imports: [
    CommonModule,
    ShowTimeSlotsComponent,
    CustomSliderComponent,
    ToFormatBrlPipe,
    MoneyInputDirective,
    FormsModule,
    ReactiveFormsModule,
  ],
  styles: `
  :host {
    display: block;
    width: 100%;
  }`,
})
export class ConfigureBusinessComponent implements OnInit {
  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      revenueGoal: [0],
    });
  }

  private readonly businessService = inject(BusinessService);
  public readonly form: FormGroup;

  public minRevenue: number = 5000;
  public maxRevenue: number = 50_000_00;
  public stepRevenue: number = 10_00;
  public business?: Business;

  public ngOnInit(): void {
    this.getSessionBusiness();
  }

  public async getSessionBusiness() {
    this.business = await firstValueFrom(this.businessService.getBusinessSession());
    this.form.patchValue({
      name: this.business.name,
      revenueGoal: this.business.revenueGoal,
    });
  }
}
