import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({ templateUrl: './hub-layout.component.html', imports: [RouterModule, CommonModule] })
export class HubLayoutComponent {
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
