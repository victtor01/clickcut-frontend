import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileSidebarConfigure } from '../components/mobile-sidebar/mobile-sidebar-configure.component';
import { SidebarConfigureComponent } from '../components/sidebar/sidebar-configure.component';

@Component({
  templateUrl: './configure.component.html',
  imports: [SidebarConfigureComponent, RouterOutlet, MobileSidebarConfigure],
})
export class ConfigureComponent {}
