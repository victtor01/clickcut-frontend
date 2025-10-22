import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Business, TimeSlot } from '@app/core/models/Business';
import { MemberShip } from '@app/core/models/MemberShip';
import { User } from '@app/core/models/User';
import { UpdateBusinessDTO } from '@app/core/schemas/update-business.dto';
import { AuthService } from '@app/core/services/auth.service';
import { BusinessService } from '@app/core/services/business.service';
import { MembersService } from '@app/core/services/members.service';
import { ToastService } from '@app/core/services/toast.service';
import { CustomSliderComponent } from '@app/shared/components/custom-slider/custom-slider.component';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { filter, firstValueFrom } from 'rxjs';

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
      paymentAccountId: [null as string | null],
    });
  }

  private readonly destroyRef = inject(DestroyRef);
  private readonly businessService = inject(BusinessService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly membersService = inject(MembersService);

  public readonly form: FormGroup;

  public isLoading: boolean = false;
  public minRevenue: number = 5000;
  public maxRevenue: number = 50_000_00;
  public stepRevenue: number = 10_00;

  public members?: MemberShip[];
  public business?: Business;

  public owner?: User;

  public reviewLogoUrl?: string;
  public reviewBannerUrl?: string;

  public fileLogo?: File;
  public fileBanner?: File;

  public async ngOnInit(): Promise<void> {
    await this.getSessionBusiness();
    await this.getMembers();
  }

  public async getSessionBusiness(): Promise<void> {
    this.businessService.loadBusinessSession().subscribe();

    const business = await firstValueFrom(
      this.businessService.businessSession$.pipe(filter((b): b is Business => b !== null)),
    );

    
    this.business = business;
    this.reviewBannerUrl = business.bannerUrl;
    this.reviewLogoUrl = business.logoUrl;

    console.log(this.business)

    this.form.patchValue({
      name: business.name,
      revenueGoal: business.revenueGoal,
      paymentAccountId: business.paymentReceiverId,
    });
  }

  public async getMembers(): Promise<void> {
    if (!this.business) return;

    const currMember = await firstValueFrom(this.authService.currentUser$);
    const members = await firstValueFrom(this.membersService.findAll());

    if (this.business?.ownerId) {
      this.owner = currMember;
    }

    this.members = members || [];
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
      return;
    }

    this.isLoading = true;

    const data = {
      name: this.form.get('name')?.value,
      revenueGoal: this.form.get('revenueGoal')?.value,
      paymentAccountId: this.form.get('paymentAccountId')?.value,
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
