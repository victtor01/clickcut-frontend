import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { BusinessService } from '@app/core/services/business.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-security', // Adicione o seletor
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './security.component.html',
})
export class SecurityComponent implements OnInit {
  public business?: Business;

  public userPasswordForm: FormGroup;
  public businessPasswordForm: FormGroup;

  public hideCurrentPassword = signal(true);
  public hideNewPassword = signal(true);
  public hideConfirmPassword = signal(true);

  private businessService = inject(BusinessService);

  constructor(private fb: FormBuilder) {
    this.userPasswordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        // Validador para garantir que a nova senha e a confirmação são iguais
        // validators: this.passwordMatchValidator
      },
    );

    this.businessPasswordForm = this.fb.group(
      {
        newPin: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(4),
            Validators.pattern(/^\d+$/),
          ],
        ],
        confirmPin: ['', Validators.required],
      },
      {
        // validators: this.pinMatchValidator
      },
    );
  }

  public ngOnInit(): void {
    this.fetchBusiness();
  }

  public onUserPasswordSubmit(): void {
    if (this.userPasswordForm.invalid) return;
  }

  public async onBusinessPasswordSubmit(): Promise<void> {
    if (this.businessPasswordForm.invalid) return;

    try {
      const password = this.businessPasswordForm.get('newPin')?.value;

      await firstValueFrom(this.businessService.updatePassword(password));
      await this.fetchBusiness();
    } catch (err) {
      console.log(err);
    }

    console.log('Definindo senha do negócio:', this.businessPasswordForm.value);
  }

  public removeBusinessPassword(): void {
    console.log('Removendo senha do negócio...');
  }

  private async fetchBusiness(): Promise<void> {
    this.business = await firstValueFrom(this.businessService.getBusinessSession());
  }
}
