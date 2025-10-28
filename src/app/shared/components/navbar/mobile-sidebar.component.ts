// mobile-sidebar.component.ts

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ALTERADO: Renomeado para representar apenas os links de navegação
interface NavTab {
  id: string;
  icon: string;
  route: string;
}

// NOVO: Interface para os itens dentro do menu
interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  templateUrl: './mobile-sidebar.component.html',
  selector: 'mobile-sidebar',
  imports: [CommonModule, RouterModule],
  styleUrl: './mobile-sidebar.component.scss',
})
export class MobileSidebarComponent implements AfterViewInit {
  // --- ALTERADO: Agora contém apenas os links que aparecerão diretamente na barra ---
  public navTabs: NavTab[] = [
    { id: 'home', icon: 'home', route: '/home' },
    { id: 'services', icon: 'shopping_bag', route: '/services' },
    { id: 'bookings', icon: 'event', route: '/bookings' },
  ];

  // --- NOVO: Itens que serão exibidos dentro do painel do menu ---
  public menuItems: MenuItem[] = [
    { label: 'Configurações', icon: 'settings', route: '/configure' },
    { label: 'Clientes', icon: 'identity_platform', route: '/clients' },
    { label: 'Comissões', icon: 'sell', route: '/payroll' },
  ];

  public activeTabId: string;
  public indicatorStyle: { [key: string]: any } = { opacity: 0 };

  // --- NOVO: Estado para controlar a visibilidade do menu ---
  public isMenuOpen = false;

  @ViewChildren('tabElement') private tabElements!: QueryList<ElementRef<HTMLElement>>;
  private animationTimeout?: number;

  constructor(private readonly router: Router) {
    this.activeTabId = this.navTabs[0].id;
  }

  ngOnInit(): void {
    const currentTab = this.navTabs.find((tab) => this.router.url.startsWith(tab.route));
    if (currentTab) {
      this.activeTabId = currentTab.id;
    }
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
    // ALTERADO: usa 'navTabs' em vez de 'tabs'
    const activeIndex = this.navTabs.findIndex((tab) => tab.id === activeTab.id);
    const tabElement = this.tabElements?.toArray()[activeIndex]?.nativeElement;
    if (!tabElement) return;
    // ... (resto da lógica do indicador permanece a mesma)
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
