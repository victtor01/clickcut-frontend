import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CreateClientAccountDTO } from '@app/core/schemas/create-account.dto';
import { ClientAccountService } from '@app/core/services/clients-account.service';

@Component({
  templateUrl: './signup-hub.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.5s ease-in-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class SignupComponent {
  step = 1;
  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private readonly clientsService: ClientAccountService,
  ) {
    this.signupForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  public passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  public nextStep(): void {
    this.step++;
  }

  public prevStep(): void {
    this.step--;
  }

  public onSubmit(): void {
    if (this.signupForm.valid) {
      const form = this.signupForm.value;

      const data: CreateClientAccountDTO = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
      };

      this.clientsService.createAccount(data).subscribe();
    } else {
      console.log('Formulário inválido.');
      this.signupForm.markAllAsTouched();
    }
  }
}
