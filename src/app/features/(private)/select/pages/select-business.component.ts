import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { BusinessService } from '@app/core/services/business.service';
import { ToastService } from '@app/core/services/toast.service';
import { PinEntryComponent } from '../components/pin-entry/pin-entry.component';

@Component({
  templateUrl: './select-business.component.html',
  styleUrl: './select-business.component.css',
  imports: [CommonModule, RouterLink, PinEntryComponent],
})
export class SelectBusinessComponent implements OnInit {
  public business?: Business[];

  public selectedBusiness?: Business;

  @ViewChild(PinEntryComponent) pinEntryComponent?: PinEntryComponent;

  constructor(
    private readonly businessService: BusinessService,
    private readonly toastService: ToastService,
    private readonly router: Router,
  ) {}

  public ngOnInit(): void {
    this.businessService.getAll().subscribe({
      next: (value) => {
        this.business = value || [];
      },
    });
  }

  public selectBusiness(business: Business): void {
    // Se o negócio não tem senha, faz o login direto.
    if (!business.hasPassword) {
      this.loginToBusiness(business.id);
    } else {
      // Se tem senha, apenas mostra o modal.
      this.selectedBusiness = business;
    }
  }

  public onPinVerify(pin: string): void {
    if (!this.selectedBusiness) return;

    // Chama o serviço de login passando a senha
    this.loginToBusiness(this.selectedBusiness.id, pin);
  }

  private loginToBusiness(businessId: string, password?: string): void {
    this.businessService.select(businessId, password).subscribe({
      next: () => {
        this.toastService.success(`Login bem-sucedido`);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        if (this.pinEntryComponent) {
          this.pinEntryComponent.showError(err.error?.message || 'Senha incorreta.');
        } else {
          this.toastService.error(err.error?.message || 'Não foi possível conectar-se à loja');
        }
      },
    });
  }
  
  public onCancelPinEntry(): void {
    this.selectedBusiness = undefined;
  }

  public select(business: Business, password?: string) {
    if (business.hasPassword && !password) {
      this.selectedBusiness = business;
      return;
    }

    this.businessService.select(business.id).subscribe({
      next: (_) => {
        this.toastService.success(`Login bem-sucedido`);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log(err);
        this.toastService.error('Não foi possível conectar-se a loja');
      },
    });
  }
} 
