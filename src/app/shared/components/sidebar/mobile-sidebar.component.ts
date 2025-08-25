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
  constructor(private readonly router: Router) {}

  tabs: Tab[] = [
    { id: 'home', icon: 'home', route: "/home" },
    { id: 'services', icon: 'shopping_bag', route: "#" },
    { id: 'clients', icon: 'contacts', route: "#" },
    { id: 'bookings', icon: 'event', route: "/bookings" },
  ];

  activeTabId: string = this.tabs[0].id;
  indicatorStyle = {};

  private animationTimeout: any; // Para gerenciar o timeout

  @ViewChildren('tabElement') tabElements!: QueryList<
    ElementRef<HTMLLIElement>
  >;

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    const activeTab = this.tabs.find((tab) => tab.id === this.activeTabId);
    if (activeTab) {
      // Ao redimensionar, apenas movemos para o estado final, sem a animação complexa
      this.moveIndicatorWithoutAnimation(activeTab);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.moveIndicatorWithoutAnimation(this.tabs[0]), 0);
  }

  selectTab(tab: Tab) {
    this.activeTabId = tab.id;
    this.moveIndicator(tab); // <-- Usa a nova função com animação
    this.router.navigateByUrl(tab.route);
  }
  private moveIndicator(activeTab: Tab) {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }

    const activeIndex = this.tabs.findIndex((tab) => tab.id === activeTab.id);
    const tabElement = this.tabElements.toArray()[activeIndex]?.nativeElement;

    if (tabElement) {
      const travelingWidth = '1.5rem'; // w-5
      const finalWidth = '0.5rem'; // w-2
      const destinationCenter =
        tabElement.offsetLeft + tabElement.clientWidth / 2;

      // Fase 1: Inicia a transição com a largura de "viagem"
      this.indicatorStyle = {
        left: `${destinationCenter}px`,
        width: travelingWidth,
        transform: 'translateX(-50%)',
      };

      // Fase 2: Agenda a mudança para a largura final
      this.animationTimeout = setTimeout(() => {
        this.indicatorStyle = {
          left: `${destinationCenter}px`,
          width: finalWidth,
          transform: 'translateX(-50%)',
        };
      }, 150);
    }
  }

  private moveIndicatorWithoutAnimation(activeTab: Tab) {
    const activeIndex = this.tabs.findIndex((tab) => tab.id === activeTab.id);
    const tabElement = this.tabElements.toArray()[activeIndex]?.nativeElement;
    if (tabElement) {
      const finalWidth = '0.5rem'; // w-2
      const destinationCenter =
        tabElement.offsetLeft + tabElement.clientWidth / 2;
      this.indicatorStyle = {
        left: `${destinationCenter}px`,
        width: finalWidth,
        transform: 'translateX(-50%)',
      };
    }
  }
}
