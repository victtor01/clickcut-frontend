import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { ThemeService } from '@app/core/services/theme.service';
import { ToastService } from '@app/core/services/toast.service';
import { LogoComponent } from '@app/shared/components/logo/logo.component';

@Component({
  templateUrl: './login.component.html',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, LogoComponent],
})
export class LoginComponent {
  public loginForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiService: ApiService,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly _: ThemeService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.toastService.error('Formulário inválido');
      return;
    }

    this.apiService.post('/auth', this.loginForm.value).subscribe({
      next: (data) => {
        console.log(data)
        this.toastService.success(`Login bem-sucedido`);
        this.router.navigate(['/select']);
      },
      error: (err) => {
        console.log(err);
        this.toastService.error('Email ou senha incorretos!');
      },
    });
  }
}
