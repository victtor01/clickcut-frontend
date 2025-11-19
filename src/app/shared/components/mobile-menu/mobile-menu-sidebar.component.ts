import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

// Ícones baseados no seu Sidebar Desktop
import {
  saxBag2Outline,
  saxHome2Outline,
  saxLinkSquareOutline,
  saxLogoutOutline,
  saxPeopleOutline,
  saxProfile2userOutline,
} from '@ng-icons/iconsax/outline';
import { solarCalendarMarkLinear, solarTagLinear } from '@ng-icons/solar-icons/linear'; // Solar icons variam, ajustei para linear padrão

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent],
  providers: [
    provideIcons({
      saxHome2Outline,
      solarCalendarMarkLinear,
      saxBag2Outline,
      saxPeopleOutline,
      saxLinkSquareOutline,
      solarTagLinear,
      saxProfile2userOutline,
      saxLogoutOutline,
    }),
  ],
  template: `
    <div class="h-full w-full pt-28 pl-6 pr-10 flex flex-col text-white">
      <div class="flex items-center gap-3 mb-8 animate-fade-in-up">
        <div
          class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shadow-lg shadow-indigo-900/50"
        >
          <span class="font-bold text-lg">CY</span>
        </div>
        <div class="flex flex-col">
          <span class="font-semibold text-lg leading-tight">Olá, Usuário</span>
          <span class="text-xs text-gray-400">ClickYoup Pro</span>
        </div>
      </div>

      <nav class="flex-1 flex flex-col gap-4 overflow-y-auto pb-10">
        @for (tab of tabs; track tab.id) {
          <a
            [routerLink]="tab.route"
            class="group flex items-center gap-4 text-gray-300 dark:text-gray-500 hover:text-white transition-all duration-200 active:scale-95"
            routerLinkActive="dark:text-gray-800 dark:text-violet-50 font-semibold"
          >
            <ng-icon
              [name]="tab.icon"
              size="24"
              class="transition-transform group-hover:scale-110"
            ></ng-icon>
            <span class="text-lg tracking-wide">{{ tab.label }}</span>
          </a>
        }
      </nav>

      <div class="mt-auto pb-10">
        <button class="flex items-center gap-4 text-red-400 hover:text-red-300 transition-colors">
          <ng-icon name="saxLogoutOutline" size="24"></ng-icon>
          <span class="text-lg font-medium">Sair</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class MobileMenuComponent {
  tabs = [
    { id: 'home', icon: 'saxHome2Outline', label: 'Início', route: '/home' },
    { id: 'bookings', icon: 'solarCalendarMarkLinear', label: 'Agendas', route: '/bookings' },
    { id: 'services', icon: 'saxBag2Outline', label: 'Serviços', route: '/services' },
    { id: 'clients', icon: 'saxPeopleOutline', label: 'Clientes', route: '/clients' },
    { id: 'mp', icon: 'saxLinkSquareOutline', label: 'Integrações', route: '/integrations' },
    { id: 'payroll', icon: 'solarTagLinear', label: 'Comissões', route: '/payroll' },
    { id: 'team', icon: 'saxProfile2userOutline', label: 'Equipe', route: '/members' },
  ];
}
