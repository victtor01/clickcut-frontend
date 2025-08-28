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

// 1. Adicionamos a propriedade 'label' para o texto
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
  imports: [CommonModule, RouterModule],
})
export class SidebarComponent implements AfterViewInit {
  public tabs: Tab[] = [
    { id: 'home', icon: 'home', label: 'Início', route: '/home' },
    { id: 'services', icon: 'shopping_bag', label: 'Serviços', route: '/home' },
    { id: 'clients', icon: 'contacts', label: 'Clientes', route: '/home' },
    { id: 'bookings', icon: 'event', label: 'Agenda', route: '/bookings' },
  ];

  public activeTabId: string = this.tabs[0].id;
  public indicatorStyle: { [key: string]: any } = { opacity: 0 };

  @ViewChildren('tabElement') private tabElements!: QueryList<ElementRef<HTMLElement>>;
  private animationTimeout?: number;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const currentTab = this.tabs.find((tab) => this.router.url.startsWith(tab.route));
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

  // 2. A principal mudança está aqui: adaptamos a lógica para um eixo vertical
  private moveIndicator(activeTab: Tab, animated: boolean): void {
    if (this.animationTimeout) clearTimeout(this.animationTimeout);

    const activeIndex = this.tabs.findIndex((tab) => tab.id === activeTab.id);
    const tabElement = this.tabElements?.toArray()[activeIndex]?.nativeElement;

    if (!tabElement) return;

    // Usamos offsetTop e clientHeight para o posicionamento vertical
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
      // Fase 1: Animação de "viagem"
      this.indicatorStyle = { ...finalStyle, height: travelingHeight };
      // Fase 2: Animação final
      this.animationTimeout = window.setTimeout(() => {
        this.indicatorStyle = { ...this.indicatorStyle, height: finalHeight };
      }, 150);
    } else {
      // Movimento instantâneo
      this.indicatorStyle = finalStyle;
    }
  }
}
