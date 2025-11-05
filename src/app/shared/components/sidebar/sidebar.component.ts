import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { User } from '@app/core/models/User';
import { AuthService } from '@app/core/services/auth.service';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { PinEntryComponent } from '@app/features/(private)/select/components/pin-entry/pin-entry.component';
import { firstValueFrom } from 'rxjs';
import { BookingSearchModalComponent } from '../booking-search/booking-search.component';
import { BusinessModalComponent } from '../business-details/business-modal.component';
import { LogoComponent } from '../logo/logo.component';

interface Tab {
  id: string;
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent, PinEntryComponent],
})
export class SidebarComponent implements AfterViewInit {
  public tabs: Tab[] = [
    { id: 'home', icon: 'home', label: 'Início', route: '/home' },
    { id: 'services', icon: 'shopping_bag', label: 'Serviços', route: '/services' },
    { id: 'clients', icon: 'contacts', label: 'Clientes', route: '/clients' },
    { id: 'payroll', icon: 'sell', label: 'Comissões', route: '/payroll' },
    { id: 'bookings', icon: 'event', label: 'Agenda', route: '/bookings' },
  ];

  public isBusinessOpen = signal(true);
  public business: Business | null = null;
  public session: User | null = null;
  public activeTabId: string = this.tabs[0].id;
  public indicatorStyle: { [key: string]: any } = { opacity: 0 };
  public isLoadingSelectBusiness: boolean = false;
  public businesses: Business[] = [];

  private isOpenSearch: boolean = false;

  @ViewChildren('tabElement') private tabElements!: QueryList<ElementRef<HTMLElement>>;
  private animationTimeout?: number;

  public selectedBusiness?: Business;

  @ViewChild(PinEntryComponent)
  pinEntryComponent?: PinEntryComponent;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly businessService: BusinessService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const currentTab = this.tabs.find((tab) => this.router.url.startsWith(tab.route));
    if (currentTab) {
      this.activeTabId = currentTab.id;
    }

    this.getSessionBusiness();
    this.getSession();
    this.getAllBusiness();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateIndicatorPosition(), 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateIndicatorPosition();
  }

  public async getAllBusiness(): Promise<void> {
    this.businesses = await firstValueFrom(this.businessService.getAll());
  }

  public openBusinessDetails() {
    if (!this.business?.id) return;

    this.dialog.open(BusinessModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-zinc-950/60', 'backdrop-blur-sm'],
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
      backdropClass: ['bg-gray-200/50', 'dark:bg-zinc-950/60', 'backdrop-blur-sm'],
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

  public async getSession(): Promise<void> {
    this.session = await firstValueFrom(this.authService.currentUser$);
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
      this.router.navigate(["/create-business"]);
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
