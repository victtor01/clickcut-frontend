import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path?: string; // Opcional, pois um item pai pode não ter rota
  icon: string;
  label: string;
  isExpanded?: boolean; // Para controlar o estado aberto/fechado
  subItems?: { path: string; label: string }[]; // Array de sub-links
}

@Component({
  selector: 'sidebar-configure',
  standalone: true, // Importante para a nova arquitetura
  imports: [RouterLink, RouterLinkActive], // Módulos para navegação
  templateUrl: './sidebar-configure.component.html',
})
export class SidebarConfigureComponent {
  public navItems: NavItem[] = [
    { path: '/configure', icon: 'link', label: 'Conexões' },
    { path: '/configure/profile', icon: 'account_circle', label: 'Perfil' },
    { path: '/configure/security', icon: 'admin_panel_settings', label: 'Segurança' },
    {
      icon: 'store',
      label: 'Negócio',
      isExpanded: false, // Começa fechado
      subItems: [
        { path: '/configure/business', label: 'Geral' },
        { path: '/configure/business/links', label: 'Links' },
        { path: '/configure/business/times', label: 'Horários' },
        { path: '/configure/business/address', label: 'Endereço' },
      ],
    },
    { path: '/configure/invites', icon: 'outgoing_mail', label: 'Convites' },
    { path: '/configure/members', icon: 'assignment_ind', label: 'Membros' },
  ];

  toggleSubmenu(item: NavItem) {
    if (item.subItems) {
      item.isExpanded = !item.isExpanded;
    }
  }
}
