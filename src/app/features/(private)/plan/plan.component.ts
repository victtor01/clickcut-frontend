import { CommonModule, CurrencyPipe } from '@angular/common'; // ✨ Adicionado CurrencyPipe
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { CreateSubscriptionDTO } from '@app/core/schemas/create-subscription.dto';
import { SubscriptionsService } from '@app/core/services/subscriptions.service';
import { DefaultFooterComponent } from "@app/shared/components/default-footer/default-footer.component";
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';

// --- Assuma que estes são seus serviços e DTOs ---
// import { SubscriptionService } from '@app/core/services/subscription.service';
// import { AuthService } from '@app/core/services/auth.service';
// import { CreateSubscriptionCommand } from '@app/core/commands/subscription.command';
// --------------------------------------------------

// Declara o 'MercadoPago' (do script) para o TypeScript
declare var MercadoPago: any;

@Component({
  selector: 'app-plan',
  standalone: true,
  // ✨ Adicionado CurrencyPipe para o modal
  imports: [CommonModule, MatIconModule, RouterModule, CurrencyPipe, DefaultFooterComponent],
  templateUrl: './plan.component.html',
})
export class PlanComponent implements OnInit, OnDestroy {
	// private authService = inject(AuthService);
  private router = inject(Router);
  private subscriptionService = inject(SubscriptionsService);

  // --- Estado da UI ---
  // ✨ REFACTOR: Simplificado. 'true' se o modal estiver aberto, 'false' se não.
  public isSubmitting = signal(false);

  // ✨ REFACTOR: Armazena o plano (e seu preço) selecionado para o modal.
  public selectedPlan = signal<{ id: string; price: number } | null>(null);

  // --- Instâncias do Mercado Pago ---
  private mpInstance: any;
  private cardFormInstance: any;

  // Mapa de preços (mantido)
  public planPrices: Record<string, number> = {
    solo: 37,
    equipe: 67,
    pro: 90,
  };

  ngOnInit(): void {
    try {
      const publicKey = environment.mercadoPagoPublicKey;
      if (!publicKey || !publicKey.startsWith('TEST-')) {
        console.error('⚠️ CHAVE INVÁLIDA! ⚠️');
        alert('Erro de configuração: Chave do Mercado Pago não definida corretamente.');
        return;
      }
      this.mpInstance = new MercadoPago(publicKey, { locale: 'pt-BR' });
    } catch (e) {
      console.error('Erro ao inicializar o Mercado Pago.', e);
    }
  }

  ngOnDestroy(): void {
    // Garante que o formulário é destruído se o usuário sair da página
    this.destroyCardForm();
  }

  /**
   * ETAPA 1: Chamado quando o usuário clica em "Começar com..."
   * Abre o modal de pagamento e prepara para montar o formulário.
   */
  public selectPlan(planId: string): void {
    if (this.isSubmitting()) return;

    const price = this.planPrices[planId];
    if (!price) {
      console.error(`Plano "${planId}" não encontrado.`);
      return;
    }

    // Define o plano e abre o modal (controlado pelo @if no HTML)
    this.selectedPlan.set({ id: planId, price: price });

    // Desmonta o formulário anterior (se existir)
    this.destroyCardForm();

    // Usa setTimeout(0) para esperar o Angular criar os divs do modal no DOM
    setTimeout(() => {
      this.initializeCardForm();
    }, 0);
  }

  /**
   * Fecha o modal de pagamento e limpa o estado.
   */
  public closePaymentModal(): void {
    if (this.isSubmitting()) return; // Não deixa fechar enquanto carrega
    this.selectedPlan.set(null);
    this.destroyCardForm();
  }

  /**
   * Limpa a instância do formulário do MP
   */
  private destroyCardForm(): void {
    if (this.cardFormInstance) {
      this.cardFormInstance.unmount();
      this.cardFormInstance = null;
    }
  }

  private initializeCardForm(): void {
    if (!this.mpInstance || !this.selectedPlan()) return;
    console.log('Valor sendo enviado para o MP:', this.selectedPlan()!.price.toString());
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#e4e4e7' : '#18181b';
    const placeholderColor = isDarkMode ? '#71717a' : '#a1a1aa';
    const errorColor = isDarkMode ? '#f87171' : '#ef4444';
    const backgroundColor = isDarkMode ? '#27272a' : '#ffffff';
    const borderColor = isDarkMode ? '#52525b' : '#d4d4d8';

    const mpStyle = {
      base: {
        color: textColor,
        fontSize: '14px',
        '::placeholder': { color: placeholderColor },
        backgroundColor: backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
      },
      invalid: {
        color: errorColor,
        border: `1px solid ${errorColor}`,
      },
    };

    this.cardFormInstance = this.mpInstance.cardForm({
      amount: this.selectedPlan()!.price.toString(),
      iframe: true,
      style: mpStyle,
      // ✨ REFACTOR: IDs genéricos. Não precisamos mais do planId aqui.
      form: {
        id: 'form-checkout', // ID do <form>
        cardholderName: {
          id: 'form-checkout-cardholderName',
          placeholder: 'Nome como no cartão',
        },
        cardNumber: {
          id: 'form-checkout-cardNumber',
          placeholder: '•••• •••• •••• ••••',
        },
        cardExpirationMonth: {
          id: 'form-checkout-cardExpirationMonth',
          placeholder: 'MM',
        },
        cardExpirationYear: {
          id: 'form-checkout-cardExpirationYear',
          placeholder: 'AA',
        },
        securityCode: {
          id: 'form-checkout-securityCode',
          placeholder: 'CVV',
        },
        identificationType: {
          id: 'form-checkout-identificationType',
          placeholder: 'Tipo',
        },
        identificationNumber: {
          id: 'form-checkout-identificationNumber',
          placeholder: 'Número do documento',
        },
        issuer: { id: 'form-checkout-issuer' },
        installments: { id: 'form-checkout-installments' },
      },
      callbacks: {
        onFormMounted: (error: any) => {
          if (error) return console.warn('Formulário falhou ao montar.', error);
        },
        onError: (error: any) => {
          let userMessage = 'Dados do cartão inválidos.';
          if (error.message && error.message.includes('domain')) {
            userMessage =
              'Erro de segurança: O pagamento não pode ser processado. Verifique se está usando sua Chave Pública de TESTE.';
          } else if (error.message) {
            userMessage = error.message;
          }

          alert(userMessage);
          this.isSubmitting.set(false); // Libera o botão
        },
        onSubmit: (event: Event) => {
          event.preventDefault();
          // O <form> (submit) chama o 'submitSubscription'
        },
      },
    });
  }

  /**
   * ETAPA 3: Chamado pelo botão "Pagar" (o botão FINAL)
   * Gera o token e envia para o backend.
   */
  async submitSubscription(): Promise<void> {
    const planId = this.selectedPlan()?.id;

    if (this.isSubmitting() || !this.cardFormInstance || !planId) return;
    this.isSubmitting.set(true);

    try {
      // 1. Gera o Token do Cartão
      const response = await this.cardFormInstance.createCardToken();

      if (!response || !response.token) {
        throw new Error('Não foi possível gerar o token de pagamento.');
      }

      const { token } = response;

      const command: CreateSubscriptionDTO = {
        planId: planId,
        cardToken: token,
      };

      const data = await firstValueFrom(this.subscriptionService.create(command));

			if(data) {
				this.closePaymentModal();
				this.router.navigate(['/home']);
			}
    } catch (error: any) {
      console.error(`Erro ao assinar o plano ${planId}`, error);
      alert(`Erro ao assinar: ${error.message || 'Não foi possível processar seu pagamento.'}`);
    } finally {
      this.isSubmitting.set(false); // Reseta o estado de loading
    }
  }
}
