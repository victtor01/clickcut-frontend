import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';

interface Tab {
  id: string;
  icon: string;
  route: string;
}

@Component({
  templateUrl: './mobile-sidebar.component.html',
  selector: 'mobile-sidebar',
  imports: [CommonModule],
  styleUrl: './mobile-sidebar.component.scss',
})
export class MobileSidebarComponent implements AfterViewInit {
  // 1. Defina as abas primeiro
  public tabs: Tab[] = [
    { id: 'home', icon: 'home', route: '/home' },
    { id: 'services', icon: 'shopping_bag', route: '/services' },
    { id: 'clients', icon: 'contacts', route: '/clients' },
    { id: 'bookings', icon: 'event', route: '/bookings' },
  ];

  public activeTabId: string;
  // 2. O indicador começa invisível para evitar o "pulo"
  public indicatorStyle: { [key: string]: any } = { opacity: 0 };

  @ViewChildren('tabElement') private tabElements!: QueryList<
    ElementRef<HTMLElement>
  >;
  private animationTimeout?: number;

  constructor(private readonly router: Router) {
    // Inicialize activeTabId com um valor padrão
    this.activeTabId = this.tabs[0].id;
  }

  ngOnInit(): void {
    // 3. Lógica movida para ngOnInit, que executa DEPOIS das propriedades serem inicializadas
    const currentTab = this.tabs.find((tab) =>
      this.router.url.startsWith(tab.route)
    );
    if (currentTab) {
      this.activeTabId = currentTab.id;
    }
  }

  ngAfterViewInit(): void {
    // Usamos um pequeno timeout para garantir que os elementos já foram renderizados
    setTimeout(() => this.updateIndicatorPosition(), 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateIndicatorPosition();
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

    const finalWidth = '0.5rem';
    const destinationCenter =
      tabElement.offsetLeft + tabElement.clientWidth / 2;
    const finalStyle = {
      left: `${destinationCenter}px`,
      width: finalWidth,
      transform: 'translateX(-50%)',
      opacity: 1, // 4. Torna o indicador visível
    };

    if (animated) {
      const travelingWidth = '1.5rem';
      // Fase 1: Animação de "viagem"
      this.indicatorStyle = { ...finalStyle, width: travelingWidth };
      // Fase 2: Animação final
      this.animationTimeout = window.setTimeout(() => {
        this.indicatorStyle = { ...this.indicatorStyle, width: finalWidth };
      }, 150);
    } else {
      // Movimento instantâneo
      this.indicatorStyle = finalStyle;
    }
  }
}
