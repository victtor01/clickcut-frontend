import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ExplorePage, ExploreService } from '@app/core/services/explore.service';
import { ThemeService } from '@app/core/services/theme.service';
import { LoginModalComponent } from '@app/features/(public)/appointment/components/login-modal/login-modal.component';
import { BusinessModalComponent } from '@app/shared/components/business-details/business-modal.component';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '@app/core/services/auth.service';
import { LogoComponent } from '@app/shared/components/logo/logo.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { saxAwardOutline, saxStarOutline } from '@ng-icons/iconsax/outline';

@Component({
  templateUrl: './explore.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NgIconComponent,
    LogoComponent,
  ],
  providers: [
    provideIcons({
      saxStarOutline,
      saxAwardOutline,
    }),
  ],
})
export class ExploreComponent implements OnInit {
  private readonly exploreService = inject(ExploreService);
  public readonly dialog = inject(MatDialog);
  private readonly _ = inject(ThemeService);

  public explore?: ExplorePage;
  public userCep: string | null = null;
  public showCepModal: boolean = false;
  public scrolled: boolean = false;
  public headerVisible: boolean = true;

  private lastScrollTop: number = 0;

  private authService = inject(AuthService);

  public cepControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{8}$/)],
  });

  ngOnInit(): void {
    this.authService.checkClientSession().subscribe();
    this.checkAndLoadCep();
  }

  private checkAndLoadCep(): void {
    const storedCep = localStorage.getItem('user_cep');

    if (storedCep) {
      this.userCep = storedCep;
      this.fetchExplore(storedCep); // Correto
    } else {
      this.userCep = null;
      this.showCepModal = true;

      this.explore = { newBusinesses: [], topRatedBusinesses: [], nearYouBusinesses: [] };
    }
  }

  onScroll(event: Event): void {
    const mainElement = event.target as HTMLElement;
    const currentScrollTop = mainElement.scrollTop;

    // Lógica para o background do header (transparente no topo, com background ao rolar)
    this.scrolled = currentScrollTop > 0;

    // Lógica para esconder/mostrar o header com base na direção do scroll
    if (currentScrollTop > this.lastScrollTop && currentScrollTop > 60) {
      // Rolando para baixo e não no topo
      this.headerVisible = false;
    } else if (currentScrollTop < this.lastScrollTop) {
      // Rolando para cima
      this.headerVisible = true;
    } else if (currentScrollTop === 0) {
      // No topo da página
      this.headerVisible = true;
    }

    this.lastScrollTop = currentScrollTop;
  }

  public saveCepAndCloseModal(): void {
    if (this.cepControl.invalid) {
      this.cepControl.markAsTouched();
      return;
    }

    const newCep = this.cepControl.value;

    localStorage.setItem('user_cep', newCep);

    this.userCep = newCep;
    this.showCepModal = false;

    this.fetchExplore(newCep);
  }

  public async fetchExplore(cep: string | null = null): Promise<void> {
    if (cep && cep.length !== 8) {
      console.warn('CEP inválido detectado, busca cancelada.');
      return;
    }

    try {
      if (cep) {
        this.explore = await firstValueFrom(this.exploreService.findAll(cep!));
      }
    } catch (error) {
      console.error('Erro ao buscar dados de exploração:', error);
    }
  }

  public openLogin() {
    this.dialog.open(LoginModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-neutral-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(55rem, 100%)',
    });
  }

  public openCepInput(): void {
    this.cepControl.setValue(this.userCep || '');
    this.showCepModal = true;
  }

  public openBusinessDetails(businessId: string) {
    this.dialog.open(BusinessModalComponent, {
      backdropClass: ['bg-white/60', 'dark:bg-neutral-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(70rem, 100%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { businessId: businessId },
    });
  }
}
