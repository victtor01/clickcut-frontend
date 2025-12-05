import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { IsValidPlan as isValidPlan, SubscriptionPlan } from '@app/core/models/Subscription';
import { User } from '@app/core/models/User';
import { AuthService } from '@app/core/services/auth.service';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { PinEntryComponent } from '@app/features/(private)/select/components/pin-entry/pin-entry.component';
import { NgIcon, NgIconComponent, provideIcons } from '@ng-icons/core';
import { hugeLink06 } from '@ng-icons/huge-icons';
import {
  saxBag2Bold,
  saxHome2Bold,
  saxLinkSquareBold,
  saxMagicpenBold,
  saxPeopleBold,
  saxProfile2userBold,
} from '@ng-icons/iconsax/bold';
import { saxAddSquareBulk } from '@ng-icons/iconsax/bulk';
import {
  saxBag2Outline,
  saxHome2Outline,
  saxLinkSquareOutline,
  saxMagicpenOutline,
  saxPeopleOutline,
  saxProfile2userOutline,
} from '@ng-icons/iconsax/outline';
import {
  solarCalendarMarkBold,
  solarCrownBold,
  solarRocket2Bold,
  solarTagBold,
} from '@ng-icons/solar-icons/bold';
import { solarCalendarMark, solarTag } from '@ng-icons/solar-icons/outline';
import { firstValueFrom } from 'rxjs';
import { BookingSearchModalComponent } from '../booking-search/booking-search.component';
import { BusinessModalComponent } from '../business-details/business-modal.component';
import { CreateBookingNavbar } from '../create-booking/create-booking.component';
import { LogoComponent } from '../logo/logo.component';

interface Tab {
  id: string;
  icon: string;
  label: string;
  route: string;
  selected: string;
  plan?: SubscriptionPlan | null;
}

const icons = {
  solarCrownBold,
  solarRocket2Bold,
};

const sidebarIcons = {
  saxHome2Outline,
  saxBag2Outline,
  saxPeopleOutline,
  solarTag,
  hugeLink06,
  saxProfile2userOutline,
  solarCalendarMark,
  saxMagicpenOutline,
  saxLinkSquareOutline,
};

const sidebarBoldIcons = {
  saxHome2Bold,
  saxBag2Bold,
  saxPeopleBold,
  solarTagBold,
  saxMagicpenBold,
  saxProfile2userBold,
  solarCalendarMarkBold,
  saxLinkSquareBold,
};
@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['sidebar.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    NgIconComponent,
    LogoComponent,
    RouterModule,
    PinEntryComponent,
    CreateBookingNavbar,
    NgIcon,
  ],
  providers: [
    provideIcons({
      ...icons,
      ...sidebarBoldIcons,
      ...sidebarIcons,
      saxAddSquareBulk,
    }),
  ],
})
export class SidebarComponent implements AfterViewInit {
  public tabs: Tab[] = [
    {
      id: 'home',
      icon: 'saxHome2Outline',
      label: 'Início',
      route: '/home',
      selected: 'saxHome2Bold',
    },
    {
      id: 'bookings',
      icon: 'solarCalendarMark',
      label: 'Agendas',
      route: '/bookings',
      selected: 'solarCalendarMarkBold',
    },
    {
      id: 'services',
      icon: 'saxBag2Outline',
      label: 'Serviços',
      route: '/services',
      selected: 'saxBag2Bold',
    },
    {
      id: 'clients',
      icon: 'saxPeopleOutline',
      label: 'Clientes',
      route: '/clients',
      selected: 'saxPeopleBold',
    },
    {
      id: 'mp',
      icon: 'saxLinkSquareOutline',
      label: 'Integrações',
      route: '/integrations',
      plan: 'equipe',
      selected: 'saxLinkSquareBold',
    },
    {
      id: 'payroll',
      icon: 'solarTag',
      label: 'Comissões',
      route: '/payroll',
      plan: 'equipe',
      selected: 'solarTagBold',
    },
    {
      id: 'post',
      icon: 'saxMagicpenOutline',
      selected: 'saxMagicpenBold',
      route: '/marketing',
      plan: 'solo',
      label: 'Post',
    },
    {
      id: 'meem',
      icon: 'saxProfile2userOutline',
      label: 'Equipe',
      route: '/members',
      plan: 'equipe',
      selected: 'saxProfile2userBold',
    },
  ];

  public isBusinessOpen = signal(true);
  public business: Business | null = null;
  public activeTabId: string = this.tabs[0].id;
  public indicatorStyle: { [key: string]: any } = { opacity: 0 };
  public isLoadingSelectBusiness: boolean = false;
  public isOpenCreateBooking = signal<boolean>(false);
  private isOpenSearch: boolean = false;
  public session: User | null = null;

  public businesses = signal<Business[]>([]);
  public outhersBusiness = signal<Business[]>([]);
  public myBusiness = signal<Business[]>([]);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly businessService = inject(BusinessService);
  private readonly toastService = inject(ToastService);

  @ViewChildren('tabElement') private tabElements!: QueryList<ElementRef<HTMLElement>>;
  private animationTimeout?: number;

  public selectedBusiness?: Business;

  @ViewChild(PinEntryComponent)
  pinEntryComponent?: PinEntryComponent;

  public toggleOpenCreateBooking() {
    this.isOpenCreateBooking.update((data) => !data);
  }

  public async ngOnInit(): Promise<void> {
    const currentTab = this.tabs.find((tab) => this.router.url.startsWith(tab.route));
    if (currentTab) {
      this.activeTabId = currentTab.id;
    }

    await Promise.all([this.getSession(), this.getSessionBusiness()]);

    await this.getAllBusiness();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateIndicatorPosition(), 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateIndicatorPosition();
  }

  public get plan() {
    return this.business?.planId;
  }

  public validPlan(plan: SubscriptionPlan): boolean {
    if (this?.plan) {
      return isValidPlan(this?.plan, plan);
    }

    return false;
  }

  public async getAllBusiness(): Promise<void> {
    const all = await firstValueFrom(this.businessService.getAll());

    console.log(all);
    this.businesses.set(all);

    const my = all.length ? all.filter((b) => b.ownerId == this.session?.id) : [];

    const outhers = all.length ? all.filter((b) => b.ownerId != this.session?.id) : [];

    this.myBusiness.set(my);
    this.outhersBusiness.set(outhers);
  }

  public async getSession(): Promise<void> {
    this.session = await firstValueFrom(this.authService.currentUser$);
  }

  public openBusinessDetails() {
    if (!this.business?.id) return;

    this.dialog.open(BusinessModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-gray-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(70rem, 100%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { businessId: this.business.id },
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (!this.isOpenSearch) {
        this.openSearch();
      }
    }
  }

  public openSearch(): void {
    this.isOpenSearch = true;

    const dialogRef = this.dialog.open(BookingSearchModalComponent, {
      backdropClass: ['bg-stone-200/50', 'dark:bg-gray-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(65rem, 100%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
    });

    dialogRef.afterClosed().subscribe((value) => {
      this.isOpenSearch = false;
    });
  }

  public async openOrClose(): Promise<void> {
    if (!this.business) return;

    const data = await firstValueFrom(this.businessService.openOrClose(!this.business?.isOpen));
    this.business.isOpen = data.status;
    this.isBusinessOpen.set(data.status);
  }

  public async getSessionBusiness(): Promise<void> {
    this.business = await firstValueFrom(this.authService.currentBusiness$);

    this.isBusinessOpen.set(this.business?.isOpen ?? true);
  }

  public selectTab(tab: Tab): void {
    if (this.activeTabId === tab.id) return;
    this.activeTabId = tab.id;
    this.moveIndicator(tab, true);
    this.router.navigateByUrl(tab.route);
  }

  private updateIndicatorPosition(): void {
    const activeTab = this.tabs.find((tab) => tab.id === this.activeTabId);
    if (activeTab) {
      this.moveIndicator(activeTab, false);
    }
  }

  private moveIndicator(activeTab: Tab, animated: boolean): void {
    if (this.animationTimeout) clearTimeout(this.animationTimeout);

    const activeIndex = this.tabs.findIndex((tab) => tab.id === activeTab.id);
    const tabElement = this.tabElements?.toArray()[activeIndex]?.nativeElement;

    if (!tabElement) return;

    const destinationCenter = tabElement.offsetTop + tabElement.clientHeight / 2;
    const finalHeight = '2.5rem'; // 40px ou h-10 no Tailwind

    const finalStyle = {
      top: `${destinationCenter}px`,
      height: finalHeight,
      transform: 'translateY(-50%)', // Centraliza o indicador verticalmente no botão
      opacity: 1,
    };

    if (animated) {
      const travelingHeight = '3.5rem'; // Um pouco maior durante a animação
      this.indicatorStyle = { ...finalStyle, height: travelingHeight };
      this.animationTimeout = window.setTimeout(() => {
        this.indicatorStyle = { ...this.indicatorStyle, height: finalHeight };
      }, 150);
    } else {
      this.indicatorStyle = finalStyle;
    }
  }

  public selectBusiness(business: Business): void {
    if (!business.hasPassword) {
      this.loginToBusiness(business.id);
    } else {
      this.selectedBusiness = business;
    }
  }

  public onPinVerify(pin: string): void {
    if (!this.selectedBusiness) return;
    this.loginToBusiness(this.selectedBusiness.id, pin);
  }

  public navigateToCreateBusiness() {
    this.router.navigate(['/create-business']);
  }

  private loginToBusiness(businessId: string, password?: string): void {
    this.businessService.select(businessId, password).subscribe({
      next: () => {
        this.isLoadingSelectBusiness = true;
        this.toastService.success(`Login bem-sucedido`);
      },
      error: (err) => {
        if (this.pinEntryComponent) {
          this.pinEntryComponent.showError(err.error?.message || 'Senha incorreta.');
        } else {
          this.toastService.error(err.error?.message || 'Não foi possível conectar-se à loja');
        }
      },

      complete: () => {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
    });
  }

  public onCancelPinEntry(): void {
    this.selectedBusiness = undefined;
  }
}
