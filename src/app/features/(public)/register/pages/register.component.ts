import { CommonModule } from '@angular/common'; // Necessário para @if
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '@app/core/services/toast.service';
import { UsersService } from '@app/core/services/users.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register', // Adicionei um seletor
  standalone: true, // Adicionei standalone
  templateUrl: './register.component.html',
  imports: [RouterLink, CommonModule, ReactiveFormsModule], // Adicionei os módulos
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  public registerForm: FormGroup;
  public isSubmitting = signal(false);

  constructor() {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  // Getters para facilita?.valuer o acesso aos controles no template
  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    } else if (confirmPassword) {
      confirmPassword.setErrors(null);
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toast.error("teste")
      return;
    }

    this.isSubmitting.set(true);

    const user = await firstValueFrom(
      this.usersService.createAccount({
        username: this.username?.value!,
        email: this.email?.value!,
        password: this.password?.value!,
      }),
    );

    if (user.email) {
      this.toast.success('Conta criada com sucesso! Faça o login!');
      this.router.navigate(['/login']);
    }

    this.isSubmitting.set(false);
  }
}
