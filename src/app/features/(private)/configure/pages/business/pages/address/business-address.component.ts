import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importe HttpClientModule
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Business, BusinessAddress } from '@app/core/models/Business';
import { UpdateBusinessAddressDTO } from '@app/core/schemas/update-busienss-address.dto';
import { BusinessAddressService } from '@app/core/services/business-address.service';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { debounceTime, distinctUntilChanged, filter, firstValueFrom, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-business-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], // Adicione HttpClientModule aqui
  templateUrl: './business-address.component.html',
})
export class BusinessAddressComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly businessService = inject(BusinessService);
  private readonly addressService = inject(BusinessAddressService);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  public form: FormGroup;
  public isSubmitting = signal<boolean>(false);
  public isSearchingCep = signal<boolean>(false);
  public cepAddressLoaded = signal<boolean>(false);
  public business?: Business;

  constructor() {
    this.form = this.fb.group({
      postalCode: ['', [Validators.required, Validators.pattern(/^(\d{5}-\d{3}|\d{8})$/)]],
      street: [{ value: '', disabled: true }, Validators.required],
      number: ['', Validators.required],
      neighborhood: [{ value: '', disabled: true }, Validators.required],
      city: [{ value: '', disabled: true }, Validators.required],
      state: [{ value: '', disabled: true }, Validators.required],
      complement: [''],
    });
  }

  public ngOnInit(): void {
    this.loadBusinessData();
    this.setupCepSearch();
  }

  private loadBusinessData(): void {
    this.businessService.loadBusinessSession().subscribe();
    this.businessService.businessSession$
      .pipe(
        filter((business): business is Business => business !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((business) => {
        this.business = business;

        if (business.address) {
          this.form.patchValue(business.address, { emitEvent: false });
          this.unlockAddressFields(false);

          const address = this.business.address;

          const addressKeys = Object.keys(this.form.controls) as Array<keyof BusinessAddress>;

          addressKeys.forEach((key) => {
            if (key !== 'complement' && address?.[key]) {
              this.form.controls[key].disable();
            }
          });

          this.cepAddressLoaded.set(true);
        }
      });
  }
  private setupCepSearch(): void {
    const postalCodeControl = this.form.get('postalCode')!;

    postalCodeControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((cep) => /^(\d{5}-\d{3}|\d{8})$/.test(cep)),
        tap(() => {
          this.isSearchingCep.set(true);
          this.cepAddressLoaded.set(false);
        }),
        switchMap((cep) =>
          this.http.get(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data: any) => {
          if (data.erro) {
            this.isSearchingCep.set(false);
            this.unlockAddressFields(true);
            this.toastService.error('CEP não encontrado');
          } else {
            this.fillAndLockAddress(data);
            this.cepAddressLoaded.set(true);
          }
        },
        error: () => this.isSearchingCep.set(false),
      });
  }

  private fillAndLockAddress(data: any): void {
    const currentValues = this.form.getRawValue();

    const newValues = {
      city: data.localidade,
      state: data.uf,
      street: data.logradouro || currentValues.street,
      neighborhood: data.bairro || currentValues.neighborhood,
    };

    this.form.patchValue(newValues);

    this.form.controls['city'].disable();
    this.form.controls['state'].disable();
    this.form.controls['number'].disable();
    this.form.controls['street'].disable();
    this.form.controls['neighborhood'].disable();

    // Foca no campo "número" após o preenchimento
    document.getElementById('number')?.focus();

    this.isSearchingCep.set(false);
  }

  public unlockAddressFields(clearFields: boolean = false): void {
    this.form.controls['street'].enable();
    this.form.controls['neighborhood'].enable();
    this.form.controls['city'].enable();
    this.form.controls['state'].enable();
    this.form.controls['postalCode'].enable();
    this.cepAddressLoaded.set(false);

    if (clearFields) {
      this.form.patchValue({
        street: '',
        neighborhood: '',
        city: '',
        state: '',
      });
    }
  }

  public resetCepSearch(): void {
    this.form.get('postalCode')?.setValue('');
    this.unlockAddressFields(true);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    try {
      const form = this.form.getRawValue();

      const data: UpdateBusinessAddressDTO = {
        cep: form.postalCode,
        street: form.street,
        number: form.number,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        complement: form.complement,
      };

      await firstValueFrom(this.addressService.update(data));

      this.toastService.success('Atualizad com sucesso!');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
