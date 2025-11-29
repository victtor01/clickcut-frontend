import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsersService } from '@app/core/services/users.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  // --- Injeção de Dependências ---
  private fb = inject(FormBuilder);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private usersService = inject(UsersService);

  // --- Estado do Componente ---
  public token = signal<string | null>(null);
  public submissionState = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  public errorMessage = signal<string>('');
  public hidePassword = signal(true);
  public hideConfirm = signal(true);
  public resetForm: FormGroup;

  constructor() {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const receivedToken = params['token'];
        if (receivedToken) {
          this.token.set(receivedToken);
        } else {
          this.submissionState.set('error');
          this.errorMessage.set('Token de redefinição inválido ou ausente na URL.');
        }
    });
  }
  
  // Validador customizado para conferir se as senhas são iguais
  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword?.pristine || confirmPassword?.pristine) {
      return null;
    }

    return newPassword && confirmPassword && newPassword.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  }

  async onSubmit(): Promise<void> {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    
    this.submissionState.set('loading');
    this.errorMessage.set('');
    
    try {
      const { newPassword, confirmPassword } = this.resetForm.value;

			await firstValueFrom(this.usersService.resetPassword(this.token()!, newPassword, confirmPassword));

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.submissionState.set('success');

			setTimeout(() => this.router.navigate(['/login']), 3000); 
    } catch (error: any) {
      this.submissionState.set('error');
      this.errorMessage.set(error.error?.message || 'Ocorreu um erro ao redefinir a senha. Tente novamente.');
      setTimeout(() => this.submissionState.set('idle'), 5000);
    }
  }
}