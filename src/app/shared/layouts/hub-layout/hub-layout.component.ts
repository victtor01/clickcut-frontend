import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@app/core/services/theme.service';

@Component({ templateUrl: './hub-layout.component.html', imports: [RouterModule, CommonModule] })
export class HubLayoutComponent {
  constructor(public readonly themeService: ThemeService) {}

  public handleTheme() {
    this.themeService.toggleTheme();
  }

  public get isDark() {
    return this.themeService.theme() === 'dark';
  }

  public navLinks = [
    {
      label: 'Agendamentos',
      icon: 'calendar_month',
      path: ['/hub', 'home'],
    },
    {
      label: 'Favoritos',
      icon: 'favorite_border',
      path: ['/hub', 'favorites'],
    },
    {
      label: 'Histórico',
      icon: 'history',
      path: ['/hub', 'history'], // Atualize o path conforme necessário
    },
    {
      label: 'Pagamentos',
      icon: 'credit_card',
      path: ['/hub', 'payments'], // Atualize o path conforme necessário
    },
  ];
}
