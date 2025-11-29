import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService } from '@app/core/services/users.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  public submissionState = signal<'idle' | 'loading' | 'success' | 'error'>('idle');

  public forgotForm!: FormGroup;

  public usersService = inject(UsersService);

  constructor(private fb: FormBuilder) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotForm.get('email');
  }

  async onSubmit(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.submissionState.set('loading');

    try {
      const emailValue = this.forgotForm.value.email!;
      await firstValueFrom(this.usersService.forgotPassword(emailValue));

      this.submissionState.set('success');
    } catch (error) {
      this.submissionState.set('error');
      setTimeout(() => this.submissionState.set('idle'), 5000); // Permite tentar de novo
    }
  }
}
