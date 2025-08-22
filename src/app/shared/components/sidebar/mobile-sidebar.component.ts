import { CommonModule } from '@angular/common';
import {
	AfterViewInit,
	Component,
	ElementRef,
	QueryList,
	ViewChildren,
} from '@angular/core';

interface Tab {
  id: string;
  icon: string;
}

@Component({
  templateUrl: './mobile-sidebar.component.html',
  selector: 'mobile-sidebar',
  imports: [CommonModule],
  styleUrl: './mobile-navbar.component.scss',
})
export class MobileSidebarComponent implements AfterViewInit {
  tabs: Tab[] = [
    { id: 'home', icon: 'home' },
    { id: 'services', icon: 'shopping_bag' },
    { id: 'clients', icon: 'plumbing' },
    { id: 'business', icon: 'business' },
  ];

  activeTabId: string = this.tabs[0].id; // Define a primeira aba como ativa
  indicatorStyle = {}; // Objeto que guardará o estilo CSS do indicador

  // Pegamos referências a todos os <li> no HTML para medir suas posições
  @ViewChildren('tabElement') tabElements!: QueryList<
    ElementRef<HTMLLIElement>
  >;

  ngAfterViewInit() {
    // Atraso pequeno para garantir que tudo foi renderizado antes de posicionar o indicador
    setTimeout(() => this.moveIndicator(this.tabs[0]), 0);
  }

  selectTab(tab: Tab, event: MouseEvent) {
    this.activeTabId = tab.id;
    this.moveIndicator(tab);
  }

  private moveIndicator(activeTab: Tab) {
    const activeIndex = this.tabs.findIndex((tab) => tab.id === activeTab.id);
    const tabElement = this.tabElements.toArray()[activeIndex]?.nativeElement;

    if (tabElement) {
      // Calculamos o centro do ícone ativo para posicionar o indicador
      const offsetLeft = tabElement.offsetLeft;
      const elementWidth = tabElement.clientWidth;
      const indicatorPosition = offsetLeft + elementWidth / 2;

      // Atualizamos o estilo. O [ngStyle] no HTML aplicará isso.
      this.indicatorStyle = {
        left: `${indicatorPosition}px`,
        transform: 'translateX(-50%)',
      };
    }
  }
}
