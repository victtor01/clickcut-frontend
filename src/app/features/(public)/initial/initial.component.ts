import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@app/core/services/theme.service';
import { LoginModalComponent } from '../appointment/components/login-modal/login-modal.component';

@Component({
  templateUrl: 'initial.component.html',
  imports: [CommonModule, RouterModule],
})
export class InitialComponent {
  constructor(private readonly loginDialog: MatDialog) {}

  public themeService = inject(ThemeService);

  public billingCycle = signal<'monthly' | 'yearly'>('monthly');

  public openLoginModal() {
    this.loginDialog.open(LoginModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-zinc-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(55rem, 90%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  setBillingCycle(cycle: 'monthly' | 'yearly') {
    this.billingCycle.set(cycle);
  }
}
