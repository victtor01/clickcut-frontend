import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

// Seus componentes
import { MobileMenuComponent } from '@app/shared/components/mobile-menu/mobile-menu-sidebar.component';
import { SidebarComponent } from '@app/shared/components/sidebar/sidebar.component';
import { MobileNavBarComponent } from '../../components/navbar/mobile-sidebar.component';

// Ícones
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { hugeMenu02 } from '@ng-icons/huge-icons';
import { solarCloseCircleLinear } from '@ng-icons/solar-icons/linear';

@Component({
  selector: 'app-home-layout',
  styleUrl: './home-layout.component.scss',
  imports: [
    CommonModule,
    RouterModule,
    MobileNavBarComponent,
    SidebarComponent,
    NgIconComponent,
    MobileMenuComponent,
  ],
  providers: [provideIcons({ hugeMenu02, solarCloseCircleLinear })],
  templateUrl: './home-layout.component.html',
})
export class HomeLayoutComponent implements OnDestroy {
  private router = inject(Router);
  private routerSub: Subscription;
  private lastScrollTop = 0;

  public isSidebarOpen = signal(false);
  public showMenuButton = signal(true);

  constructor() {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isSidebarOpen.set(false);
      }
    });
  }

  toggleSidebar() {
    this.isSidebarOpen.update((val) => !val);
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  onMainScroll(event: Event) {
    const target = event.target as HTMLElement;
    const currentScroll = target.scrollTop;

    if (this.isSidebarOpen()) {
      this.showMenuButton.set(true);
      return;
    }

    if (currentScroll < 1) {
      this.showMenuButton.set(true);
      this.lastScrollTop = currentScroll;
      return;
    }

    if (currentScroll > this.lastScrollTop) {
      this.showMenuButton.set(false); // Descendo
    } else {
      this.showMenuButton.set(true);  // Subindo
    }

    this.lastScrollTop = currentScroll;
  }
}
