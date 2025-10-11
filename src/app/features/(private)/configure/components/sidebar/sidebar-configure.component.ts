import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'sidebar-configure',
  standalone: true, // Importante para a nova arquitetura
  imports: [RouterLink, RouterLinkActive], // Módulos para navegação
  templateUrl: './sidebar-configure.component.html',
})
export class SidebarConfigureComponent {
  public navItems = [
    { path: '/configure', icon: 'link', label: 'Conexões' },
    { path: '/configure/business', icon: 'store', label: 'Negócio' },
    { path: '/configure/profile', icon: 'account_circle', label: 'Perfil' },
    { path: '/configure/invites', icon: 'outgoing_mail', label: 'Convites' },
    { path: '/configure/members', icon: 'assignment_ind', label: 'Membros' },
    { path: '/configure/security', icon: 'admin_panel_settings', label: 'Segurança' },
  ];
}
