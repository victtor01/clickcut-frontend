import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Business, TimeSlot } from '@app/core/models/Business';
import { User } from '@app/core/models/User';
import { UpdateBusinessDTO } from '@app/core/schemas/update-business.dto';
import { BusinessService } from '@app/core/services/business.service';
import { MembersService } from '@app/core/services/members.service';
import { ToastService } from '@app/core/services/toast.service';
import { CustomSliderComponent } from '@app/shared/components/custom-slider/custom-slider.component';
import { MoneyInputDirective } from '@app/shared/directives/app-money-input.directive';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import {
  catchError,
  filter,
  first,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
  timer,
} from 'rxjs'; // ✨ Importado RxJS

export interface WeeklySchedule {
  [day: number]: {
    isActive: boolean;
    slots: TimeSlot[];
  };
}

@Component({
  selector: 'app-configure-business', // ✨ Adicionado
  standalone: true, // ✨ Adicionado
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
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef); // ✨ Injetado
  private readonly businessService = inject(BusinessService);
  private readonly toastService = inject(ToastService);
  private readonly membersService = inject(MembersService);

  // --- Estado do Formulário ---
  public readonly form: FormGroup;

  // --- Estado da UI ---
  public isLoading: boolean = false;
  public minRevenue: number = 5000;
  public maxRevenue: number = 50_000_00;
  public stepRevenue: number = 10_00;

  public members?: User[];
  public business?: Business;

  public reviewLogoUrl?: string;
  public reviewBannerUrl?: string;

  public fileLogo?: File;
  public fileBanner?: File;

  public isCheckingHandle = signal(false);
  public isHandleAvailable = signal(true); // Começa como true

  constructor() {
    this.form = this.formBuilder.group({
      // Controles existentes
      name: ['', [Validators.required]],
      revenueGoal: [0],
      paymentAccountId: [null as string | null],
      handle: [
        '',
        [Validators.required, Validators.pattern(/^[a-z0-9_]{3,20}$/)], // Validação síncrona
        [this.handleAvailabilityValidator()], // Validação assíncrona (com debounce)
      ],
      description: ['', [Validators.maxLength(150)]],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(\(?\d{2}\)?\s?)?(\d{4,5}-?\d{4})$/), // Regex para (11) 98888-7777 ou 11988887777
        ],
      ],
    });
  }

  get name() {
    return this.form.get('name');
  }
  get revenueGoal() {
    return this.form.get('revenueGoal');
  }
  get paymentAccountId() {
    return this.form.get('paymentAccountId');
  }
  get handle() {
    return this.form.get('handle');
  }
  get description() {
    return this.form.get('description');
  }
  get phoneNumber() {
    return this.form.get('phoneNumber');
  }

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

    this.form.patchValue({
      name: business.name,
      revenueGoal: business.revenueGoal,
      paymentAccountId: business.paymentReceiverId,
      handle: business.profile?.handle,
      description: business.profile?.description,
      phoneNumber: business.profile?.phoneNumber,
    });
  }

  private handleAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || (control.pristine && !control.touched)) {
        return of(null);
      }

      this.isCheckingHandle.set(true);
      this.isHandleAvailable.set(false);

      return timer(500).pipe(
        switchMap(() => this.businessService.avaibleHandle(control.value)),
        map((isAvailable) => {
          this.isCheckingHandle.set(false);
          this.isHandleAvailable.set(isAvailable);
          return isAvailable ? null : { handleTaken: true };
        }),
        catchError(() => {
          this.isCheckingHandle.set(false);
          this.isHandleAvailable.set(true);
          return of(null);
        }),
        first(), 
      );
    };
  }

  public async getMembers(): Promise<void> {
    if (!this.business) return;

    const members = await firstValueFrom(this.membersService.findWithMercadoPago());

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
      handle: this.form.get('handle')?.value,
      description: this.form.get('description')?.value,
      phoneNumber: this.form.get('phoneNumber')?.value,
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
