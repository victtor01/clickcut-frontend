import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  templateUrl: 'mobile-sidebar-configure.component.html',
  selector: 'mobile-sidebar-configure',
  imports: [CommonModule, RouterModule],
})
export class MobileSidebarConfigure {
  public navItems = [
    { path: '/configure', icon: 'graph_1', label: 'Conexões' },
    { path: '/configure/profile', icon: 'account_circle', label: 'Perfil' },
    { path: '/configure/security', icon: 'admin_panel_settings', label: 'Segurança' },
    { path: '/configure/business', icon: 'store', label: 'Negócio' },
    { path: '/configure/business/times', icon: 'local_convenience_store', label: 'Horários' },
    { path: '/configure/business/links', icon: 'link', label: 'Links' },
    { path: '/configure/business/address', icon: 'distance', label: 'Endereço' },
    { path: '/configure/invites', icon: 'outgoing_mail', label: 'Convites' },
    { path: '/configure/members', icon: 'assignment_ind', label: 'Membros' },
  ];
}
