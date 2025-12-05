import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    inject,
    QueryList,
    signal,
    ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Event, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { AuthService } from '@app/core/services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
    saxCalendarBold,
    saxHome1Bold,
    saxMenuBold,
    saxShoppingBagBold,
} from '@ng-icons/iconsax/bold';
import {
    saxCalendarOutline,
    saxHome1Outline,
    saxMenuOutline,
    saxShopOutline,
    saxShoppingBagOutline,
} from '@ng-icons/iconsax/outline';
import { filter, Subscription } from 'rxjs';
import { BusinessModalComponent } from '../business-details/business-modal.component';
import { CreateBookingNavbar } from '../create-booking/create-booking.component';

interface NavTab {
  id: string;
  iconBold: string;
  iconOutline: string;
  route: string;
}

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  templateUrl: './mobile-sidebar.component.html',
  selector: 'mobile-navbar',
  imports: [CommonModule, RouterModule, NgIconComponent, CreateBookingNavbar],
  styleUrl: './mobile-sidebar.component.scss',
  providers: [
    provideIcons({
      saxHome1Bold,
      saxHome1Outline,
      saxShoppingBagBold,
      saxShoppingBagOutline,
      saxCalendarBold,
      saxCalendarOutline,
      saxMenuBold,
      saxMenuOutline,
      saxShopOutline,
    }),
  ],
})
export class MobileNavBarComponent implements AfterViewInit {
  public navTabs: NavTab[] = [
    { id: 'home', iconBold: 'saxHome1Bold', iconOutline: 'saxHome1Outline', route: '/home' },
    {
      id: 'services',
      iconBold: 'saxShoppingBagBold',
      iconOutline: 'saxShoppingBagOutline',
      route: '/services',
    },
    {
      id: 'bookings',
      iconBold: 'saxCalendarBold',
      iconOutline: 'saxCalendarOutline',
      route: '/bookings',
    },
  ];

  public menuItems: MenuItem[] = [
    { label: 'Configurações', icon: 'settings', route: '/configure' },
    { label: 'Clientes', icon: 'identity_platform', route: '/clients' },
    { label: 'Comissões', icon: 'sell', route: '/payroll' },
  ];

  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  public isOpenCreateBooking = signal<boolean>(false);
  public avaibleDays = signal<string[]>([]);
  private routerSubscription?: Subscription;

  public business?: Business;
  public activeTabId: string;
  public indicatorStyle: { [key: string]: any } = { opacity: 0 };
  public isMenuOpen = false;

  @ViewChildren('tabElement') private tabElements!: QueryList<ElementRef<HTMLElement>>;
  private animationTimeout?: number;

  constructor(private readonly router: Router) {
    this.activeTabId = this.navTabs[0].id;

    this.routerSubscription = this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setActiveTabBasedOnUrl();
      });
  }

  private setActiveTabBasedOnUrl(): void {
    const currentTab = this.navTabs.find((tab) => this.router.url.includes(tab.route));

    if (currentTab) {
      // Se achou e é diferente do atual, atualiza
      if (currentTab.id !== this.activeTabId) {
        this.activeTabId = currentTab.id;
        setTimeout(() => this.updateIndicatorPosition(), 0);
      }
    } else {
      // SE NÃO ACHOU NENHUMA ABA (está em outra rota)
      // Limpa o ID ativo e esconde o indicador
      this.activeTabId = '';
      this.indicatorStyle = { opacity: 0 };
    }
  }

  ngOnInit(): void {
    const currentTab = this.navTabs.find((tab) => this.router.url.startsWith(tab.route));
    if (currentTab) {
      this.activeTabId = currentTab.id;
    }

    this.authService.currentBusiness$.subscribe((data) => {
      if (data) {
        this.business = data;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateIndicatorPosition(), 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateIndicatorPosition();
  }

  // --- NOVO: Função para abrir e fechar o menu ---
  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  public toggleCreate(a?: any): void {
    this.isOpenCreateBooking.update((data) => !data);
  }

  public openBusinessDetails() {
    if (!this.business?.id) return;

    this.dialog.open(BusinessModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-neutral-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(70rem, 100%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { businessId: this.business.id },
    });
  }

  public selectTab(tab: NavTab): void {
    if (this.activeTabId === tab.id) return;
    this.activeTabId = tab.id;
    this.moveIndicator(tab, true);
    this.router.navigateByUrl(tab.route);
  }

  private updateIndicatorPosition(): void {
    const activeTab = this.navTabs.find((tab) => tab.id === this.activeTabId);
    if (activeTab) {
      this.moveIndicator(activeTab, false);
    }
  }

  private moveIndicator(activeTab: NavTab, animated: boolean): void {
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
    const activeIndex = this.navTabs.findIndex((tab) => tab.id === activeTab.id);
    const tabElement = this.tabElements?.toArray()[activeIndex]?.nativeElement;
    if (!tabElement) return;
    const finalWidth = '0.5rem';
    const destinationCenter = tabElement.offsetLeft + tabElement.clientWidth / 2;
    const finalStyle = {
      left: `${destinationCenter}px`,
      width: finalWidth,
      transform: 'translateX(-50%)',
      opacity: 1,
    };
    if (animated) {
      const travelingWidth = '1.5rem';
      this.indicatorStyle = { ...finalStyle, width: travelingWidth };
      this.animationTimeout = window.setTimeout(() => {
        this.indicatorStyle = { ...this.indicatorStyle, width: finalWidth };
      }, 150);
    } else {
      this.indicatorStyle = finalStyle;
    }
  }
}
