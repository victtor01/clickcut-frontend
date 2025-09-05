import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  templateUrl: 'mobile-sidebar-configure.component.html',
  selector: 'mobile-sidebar-configure',
	imports: [CommonModule, RouterModule]
})
export class MobileSidebarConfigure {
  public navItems = [
    { path: '/configure', icon: 'link', label: 'Conexões' },
    { path: '/configure/business', icon: 'store', label: 'Negócio' },
    { path: '/configure/perfil', icon: 'account_circle', label: 'Perfil' },
    { path: '/configure/security', icon: 'admin_panel_settings', label: 'Segurança' },
  ];
}
