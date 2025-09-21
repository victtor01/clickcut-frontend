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
import { UpdateBusinessDTO } from '@app/core/schemas/update-business.dto';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';
import { CustomSliderComponent } from '../../../../../shared/components/custom-slider/custom-slider.component';
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
    }
  `,
})
export class ConfigureBusinessComponent implements OnInit {
  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      revenueGoal: [0],
    });
  }

  private readonly businessService = inject(BusinessService);
  private readonly toastService = inject(ToastService);
  public readonly form: FormGroup;

  public isLoading: boolean = false;
  public minRevenue: number = 5000;
  public maxRevenue: number = 50_000_00;
  public stepRevenue: number = 10_00;
  public business?: Business;

  public reviewLogoUrl?: string;
  public reviewBannerUrl?: string;

  public fileLogo?: File;
  public fileBanner?: File;

  public appointmentLink = '';
  public copyState: 'idle' | 'copied' = 'idle';

  public ngOnInit(): void {
    this.getSessionBusiness();
  }

  private setupAppointmentLink(): void {
    if (this.business?.id) {
      this.appointmentLink = `${window.location.origin}/appointments/${this.business.id}`;
    }
  }

  public copyLink = () => {
    if (!this.appointmentLink) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.appointmentLink).catch((err) => {
        console.error('Falha ao copiar com a API moderna, tentando método legado.', err);
        this.copyLegacy();
      });
    } else {
      this.copyLegacy();
    }

    this.copyState = 'copied';

    setTimeout(() => {
      this.copyState = 'idle';
    }, 5000);
  };

  /**
   * Método de fallback para copiar texto em navegadores mais antigos.
   */
  private copyLegacy() {
    const textArea = document.createElement('textarea');
    textArea.value = this.appointmentLink;

    // Esconde o textarea da tela
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        console.error('Falha ao executar o comando de cópia legado.');
      }
    } catch (err) {
      console.error('Erro ao tentar copiar com o método legado: ', err);
    }

    document.body.removeChild(textArea);
  }

  public async getSessionBusiness() {
    this.business = await firstValueFrom(this.businessService.getBusinessSession());
    this.reviewBannerUrl = this.business.bannerUrl;
    this.reviewLogoUrl = this.business.logoUrl;
    this.setupAppointmentLink();
    this.form.patchValue({
      name: this.business.name,
      revenueGoal: this.business.revenueGoal,
    });
  }

  public onBannerSelectedChange(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.fileBanner = file;

      const reader = new FileReader();

      reader.onload = () => {
        this.reviewBannerUrl = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  public onLogoSelectedChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.fileLogo = file;
      const reader = new FileReader();

      reader.onload = () => {
        this.reviewLogoUrl = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  public async update() {
    if (!this.form.valid) {
      this.toastService.error('Formulário incompleto!');
    }

    this.isLoading = true;

    const data = {
      name: this.form.get('name')?.value,
      revenueGoal: this.form.get('revenueGoal')?.value,
      removeLogoFile: false,
      removeBannerFile: false,
      logoFile: this.fileLogo || null,
      bannerFile: this.fileBanner || null,
    } satisfies UpdateBusinessDTO;

    await firstValueFrom(this.businessService.update(data)).catch((err) => {
      console.log(err);
      throw new Error(err);
    });

    this.isLoading = false;
  }
}
