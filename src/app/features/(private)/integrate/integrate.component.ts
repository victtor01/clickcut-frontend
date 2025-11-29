import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FinancialSummaryDTO } from '@app/core/DTOs/financial-summary-response';
import { MercadoPagoService } from '@app/core/services/mercado-pago.service';
import { ToastService } from '@app/core/services/toast.service';
import { firstValueFrom } from 'rxjs';
import { MpLogoComponent } from '../configure/components/mp-logo/mp-logo.component';

// 1. Importar os Pipes para formatar moeda e data
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  templateUrl: './integrate.component.html',
  // 2. Adicionar os Pipes no imports
  imports: [MpLogoComponent, CurrencyPipe, DatePipe, RouterModule],
})
export class IntegrateComponent {
  public connectionStatus = signal<'success' | 'error' | 'not_connected'>('not_connected');
  public isConnected?: boolean;

  private readonly route = inject(ActivatedRoute);
  private readonly mercadoPagoService = inject(MercadoPagoService);
  private readonly toastService = inject(ToastService);

  // 3. O summary deve ser PÚBLICO para o template ler
  public summary = signal<FinancialSummaryDTO | null>(null);

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('success') === 'mp_connected') {
        this.connectionStatus.set('success');
      }
      if (params.get('error')) {
        this.connectionStatus.set('error');
      }
    });

    this.mercadoPagoService.getState().subscribe({
      next: (tokens) => {
        this.isConnected = !!tokens;
        if (this.isConnected) {
          this.connectionStatus.set('success');
          // 4. Chamar o fetchSummary() SÓ DEPOIS de confirmar a conexão
          this.fetchSummary();
        }
      },

      error: (err) => {
        this.isConnected = false;
      },
    });
  }

  public async connectMercadoPago(): Promise<void> {
    this.mercadoPagoService.getConnectUrl().subscribe({
      next: (value) => {
        if (value?.url) {
          window.location.href = value.url;
        }
      },
    });
  }

  private async fetchSummary(): Promise<void> {
    try {
      const data = await firstValueFrom(this.mercadoPagoService.getSummary());
      console.log(data);
      this.summary.set(data);
    } catch (ex) {
      var defaultMessage = 'Houve um erro interno!';
      let message = ex instanceof HttpErrorResponse ? ex.error.message ?? defaultMessage : defaultMessage;
      this.toastService.error(message);
    }
  }
}