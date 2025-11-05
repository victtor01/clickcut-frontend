import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ExplorePage, ExploreService } from '@app/core/services/explore.service';
import { LoginModalComponent } from '@app/features/(public)/appointment/components/login-modal/login-modal.component';
import { BusinessModalComponent } from '@app/shared/components/business-details/business-modal.component';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './explore.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
})
export class ExploreComponent implements OnInit {
  private readonly exploreService = inject(ExploreService);
  public readonly dialog = inject(MatDialog);

  public explore?: ExplorePage;
  public userCep: string | null = null;
  public showCepModal: boolean = false;

  public cepControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{8}$/)],
  });

  ngOnInit(): void {
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
          backdropClass: ['bg-white/60', 'dark:bg-zinc-950/60', 'backdrop-blur-sm'],
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
      backdropClass: ['bg-white/60', 'dark:bg-zinc-950/60', 'backdrop-blur-sm'],
      panelClass: ['dialog-no-container'],
      maxWidth: '100rem',
      width: 'min(70rem, 100%)',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: { businessId: businessId },
    });
  }
}
