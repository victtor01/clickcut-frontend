import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { ThemeService } from '@app/core/services/theme.service';
import { ClientProfileSettingsComponent } from '@app/features/(private)/clients/components/settings/client-profile-settings.component';
import { LogoComponent } from '@app/shared/components/logo/logo.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
    saxAddSquareBold,
    saxHeartBold,
    saxHome2Bold,
    saxRepeatBold,
} from '@ng-icons/iconsax/bold';
import {
    saxAddSquareOutline,
    saxHeartOutline,
    saxHome2Outline,
    saxRepeatOutline,
} from '@ng-icons/iconsax/outline';
import { firstValueFrom } from 'rxjs';

const boldIcons = {
  saxHome2Bold,
  saxHeartBold,
  saxRepeatBold,
  saxAddSquareBold,
};

const outlinedIcons = {
  saxHome2Outline,
  saxHeartOutline,
  saxRepeatOutline,
  saxAddSquareOutline,
};

@Component({
  templateUrl: './hub-layout.component.html',
  imports: [RouterModule, CommonModule, LogoComponent, NgIconComponent],
  providers: [provideIcons({ ...boldIcons, ...outlinedIcons })],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('menuBackdrop', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('menuDrawer', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0%)' })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateY(100%)' }))]),
    ]),
  ],
})
export class HubLayoutComponent {
  public isMenuOpen = false;
  private isAnimating = false;

  private touchStartY = 0;
  private currentTranslateY = 0;
  public isDragging = false;

  constructor(
    public readonly themeService: ThemeService,
    private readonly clientModalRef: MatDialog,
    private readonly authService: AuthService,
  ) {}

  public navLinks = [
    { label: 'Início', icon: 'saxHome2Outline', boldIcon: 'saxHome2Bold', path: ['/hub', 'home'] },
    {
      label: 'Favoritos',
      icon: 'saxHeartOutline',
      boldIcon: 'saxHeartBold',
      path: ['/hub', 'favorites'],
    },
    {
      label: 'Agendar',
      icon: 'saxAddSquareOutline',
      boldIcon: 'saxAddSquareBold',
      path: ['/hub', 'create'],
    },
    {
      label: 'Histórico',
      icon: 'saxRepeatOutline',
      boldIcon: 'saxRepeatBold',
      path: ['/hub', 'history'],
    },
  ];

  get mobileNavLinks() {
    return this.navLinks.slice(0, 4);
  }

  public handleTheme(): void {
    this.themeService.toggleTheme();
  }

  public get isDark(): boolean {
    return this.themeService.theme() === 'dark';
  }

  public toggleMenu(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    if (this.isMenuOpen) {
      this.currentTranslateY = 0; // Garante que a animação parta do estado aberto
    }

    this.isMenuOpen = !this.isMenuOpen;

    setTimeout(() => {
      this.isAnimating = false;
      if (!this.isMenuOpen) {
        this.isDragging = false;
        this.currentTranslateY = 0;
      }
    }, 300);
  }

  public onTouchStart(event: TouchEvent): void {
    if (this.isAnimating) return;
    this.isDragging = true;
    this.touchStartY = event.touches[0].clientY;
  }

  public onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || this.isAnimating) return;

    const currentTouchY = event.touches[0].clientY;
    const deltaY = currentTouchY - this.touchStartY;

    // Permite arrastar apenas para baixo
    if (deltaY > 0) {
      this.currentTranslateY = deltaY;
    }
  }

  public onTouchEnd(): void {
    if (!this.isDragging || this.isAnimating) return;
    this.isDragging = false;

    // Se o usuário arrastou mais de 100 pixels, fecha o menu
    if (this.currentTranslateY > 100) {
      this.toggleMenu();
    } else {
      // Caso contrário, retorna à posição original com uma animação suave
      this.currentTranslateY = 0;
    }
  }

  public async openEditProfileModal(): Promise<void> {
    const clientAccount = await firstValueFrom(this.authService.currentClient$);

    if (!clientAccount?.id) {
      return;
    }

    this.clientModalRef.open(ClientProfileSettingsComponent, {
      width: '100%',
      maxWidth: '800px', // A largura pode ser ajustada para o modal de edição
      height: '90%', // Altura ajustada para permitir scroll interno
      maxHeight: '700px',
      backdropClass: ['bg-stone-200/50', 'dark:bg-neutral-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      data: {
        user: clientAccount, // Passando os dados do usuário para o modal de edição
      },
    });
  }

  get menuTransformStyle(): string {
    const transition = this.isDragging ? 'none' : 'transform 0.3s ease-out';
    return `transform: translateY(${this.currentTranslateY}px); transition: ${transition};`;
  }

  @HostListener('document:keydown.escape')
  onKeydownHandler(): void {
    if (this.isMenuOpen) {
      this.toggleMenu();
    }
  }
}
