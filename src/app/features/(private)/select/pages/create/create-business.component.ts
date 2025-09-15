import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
// Import Reactive Forms modules
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { BusinessService } from '@app/core/services/business.service';
import { ServerService } from '@app/core/services/server.service';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { firstValueFrom } from 'rxjs';
import { MoneySvgEnterComponent } from './components/money-svg-enter/money-svg-enter.component';
import { SvgEnterComponent } from './components/svg-enter/svg-enter.component';
import { WorldSvgComponent } from './components/world-svg/world-svg.component';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pt-br');

type Step = 'NAME' | 'TIMEZONE' | 'REVENUE_GOAL';

interface TimezoneOption {
  value: string;
  label: string;
}

@Component({
  templateUrl: './create-business.component.html',
  imports: [
    SvgEnterComponent,
    CommonModule,
    MoneySvgEnterComponent,
    MoneyInputDirective,
    WorldSvgComponent,
    FormsModule,
    ReactiveFormsModule, // <-- Add ReactiveFormsModule here
  ],
  styles: `
    :host {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `,
})
export class CreateBusinessComponent implements OnInit {
  private readonly serverService = inject(ServerService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly businessService = inject(BusinessService);

  private timeZones: string[] = [];

  public businessForm!: FormGroup;
  public step: Step = 'NAME';
  public timeZoneLegends: TimezoneOption[] = [];
  public minRevenue: number = 5000;
  public maxRevenue: number = 50_000_00;
  public stepRevenue: number = 10_00;
  public business?: Business;

  public searchTerm: string = '';
  public showResults: boolean = false;
  public filteredTimezones: TimezoneOption[] = [];

  public ngOnInit(): void {
    this.initForm(); // <-- Initialize the form
    this.getTimeZones();
  }

  private initForm(): void {
    this.businessForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      revenueGoal: [this.minRevenue, [Validators.required, Validators.min(this.minRevenue)]],
      timezone: [null, Validators.required],
    });
  }

  get name() {
    return this.businessForm.get('name');
  }

  get revenueGoal() {
    return this.businessForm.get('revenueGoal');
  }
  
  get timezone() {
    return this.businessForm.get('timezone');
  }

  // --- Updated next() method with validation ---
  public next(): void {
    switch (this.step) {
      case 'NAME':
        if (this.name?.invalid) {
          this.name?.markAsTouched(); // Show validation error if any
          return;
        }
        this.step = 'REVENUE_GOAL';
        break;
      case 'REVENUE_GOAL':
        if (this.revenueGoal?.invalid) {
          this.revenueGoal?.markAsTouched();
          return;
        }
        this.step = 'TIMEZONE';
        break;
      case 'TIMEZONE':
        // This case will now be handled by the onSubmit method
        this.onSubmit();
        break;
    }
  }

  public filterTimezones(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTimezones = this.timeZoneLegends.filter((tz) =>
      tz.label.toLowerCase().includes(term)
    );
  }

  // --- Updated selectTimezone to patch the form value ---
  public selectTimezone(item: TimezoneOption): void {
    this.timezone?.setValue(item.value); // <-- Set the form control value
    this.searchTerm = item.label; // Update the input display text
    this.showResults = false;
  }

  public back() {
    switch (this.step) {
      case 'NAME':
        this.router.navigate(['/select']);
        break;
      case 'REVENUE_GOAL':
        this.step = 'NAME';
        break;
      case 'TIMEZONE':
        this.step = 'REVENUE_GOAL';
        break;
    }
  }

  // --- The final submit handler for the form ---
  public onSubmit(): void {
    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched(); // Mark all fields as touched to show errors
      console.error('Form is invalid:', this.businessForm.value);
      return;
    }

    this.businessService.create(this.businessForm.value).subscribe((response) => {
      console.log(response);
      this.router.navigate(['/select']);
    });
  }

  private autoselectUserTimezone(): void {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const foundTimezone = this.timeZoneLegends.find((tz) => tz.value === userTimeZone);

    if (foundTimezone) {
      this.timezone?.setValue(foundTimezone.value); // <-- Set form value
      this.searchTerm = foundTimezone.label;
    } else {
      const defaultTz = this.timeZoneLegends?.[0] || null;
      if (defaultTz) {
        this.timezone?.setValue(defaultTz.value); // <-- Set form value
        this.searchTerm = defaultTz.label;
      }
    }
  }

  private async getTimeZones(): Promise<void> {
    this.timeZones = await firstValueFrom(this.serverService.getTimeZones());
    this.timeZoneLegends = this.timeZones.map((tz) => ({
      value: tz,
      label: this.formatTimezoneLabel(tz),
    }));
    this.timeZoneLegends.sort((a, b) => a.label.localeCompare(b.label));
    this.autoselectUserTimezone();
    this.filteredTimezones = this.timeZoneLegends;
  }

  private formatTimezoneLabel(timezone: string): string {
    const parts = timezone.split('/');
    let cityName = parts[parts.length - 1].replace(/_/g, ' ');
    const now = dayjs().tz(timezone);
    const offset = now.format('Z');
    return `${cityName} (${offset})`;
  }
}
