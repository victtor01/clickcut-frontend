import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { ToastService } from '@app/core/services/toast.service';
import { SvgLogin } from './components/svg-login.component';

@Component({
  templateUrl: 'login-modal.component.html',
  imports: [CommonModule, SvgLogin, RouterModule, FormsModule, ReactiveFormsModule],
})
export class LoginModalComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<LoginModalComponent>,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly toastService: ToastService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  public loginForm: FormGroup;

  public close(): void {
    this.dialogRef.close();
  }

  public goToRegisterPage(): void {
    this.dialogRef.close();
    this.router.navigate(['/hub/signup']);
  }

  public async loginSubmit() {
    if (this.loginForm.valid) {
      this.authService
        .loginClient(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: () => {
            this.dialogRef.close();
            this.toastService.success('Login realizado com sucesso!');
            this.router.navigate(['hub', 'home'], { replaceUrl: true });
          },

          error: (ex) => {
            let message = 'Houve um erro desconhecido';

            if (ex instanceof HttpErrorResponse) {
              message = ex.error.message;
            }

            this.toastService.error(message);
          },
        });
    }
  }
}
