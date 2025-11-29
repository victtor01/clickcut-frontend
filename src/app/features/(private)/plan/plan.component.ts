import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { CreateSubscriptionDTO } from '@app/core/schemas/create-subscription.dto';
import { SubscriptionsService } from '@app/core/services/subscriptions.service';
import { DefaultFooterComponent } from '@app/shared/components/default-footer/default-footer.component';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';

declare var MercadoPago: any;

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    CurrencyPipe,
    DefaultFooterComponent,
    FormsModule,
  ],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
})
export class PlanComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private subscriptionService = inject(SubscriptionsService);

  public isSubmitting = signal(false);
  public selectedPlan = signal<{ id: string; price: number } | null>(null);

  // --- Estado do Cartão Visual ---
  public cardFlipped = signal(false);
  
  public cardName = signal(''); 
  public cardNumber = signal(''); // Usado no template para mostrar o número real
  public cardMonth = signal('');
  public cardYear = signal('');
  public cardCvv = signal('');
  public cardBrand = signal<string | null>(null);
  
  // ✨ ADICIONADO: Propriedade cardBin que faltava para o callback do MP
  public cardBin = signal<string>('•••• •••• •••• ••••'); 

  private mpInstance: any;
  private cardFormInstance: any;

  public planPrices: Record<string, number> = {
    solo: 37,
    equipe: 67,
    pro: 90,
  };

  ngOnInit(): void {
    try {
      const publicKey = environment.mercadoPagoPublicKey;
      if (!publicKey || !publicKey.startsWith('TEST-')) {
        console.warn('⚠️ Use uma chave de TESTE para evitar erros em localhost.');
      }
      this.mpInstance = new MercadoPago(publicKey, { locale: 'pt-BR' });
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy(): void {
    this.destroyCardForm();
  }

  public selectPlan(planId: string): void {
    if (this.isSubmitting()) return;

    const price = this.planPrices[planId];
    if (!price) return;

    this.selectedPlan.set({ id: planId, price: price });
    this.destroyCardForm();

    this.resetVisualCard();

    setTimeout(() => {
      this.initializeCardForm();
    }, 100);
  }

  public closePaymentModal(): void {
    if (this.isSubmitting()) return;
    this.selectedPlan.set(null);
    this.destroyCardForm();
  }

  private resetVisualCard() {
    this.cardFlipped.set(false);
    this.cardName.set('');
    this.cardNumber.set('');
    this.cardMonth.set('');
    this.cardYear.set('');
    this.cardCvv.set('');
    this.cardBrand.set(null);
    this.cardBin.set('•••• •••• •••• ••••');
  }

  private destroyCardForm(): void {
    if (this.cardFormInstance) {
      this.cardFormInstance.unmount();
      this.cardFormInstance = null;
    }
  }

  private initializeCardForm(): void {
    if (!this.mpInstance || !this.selectedPlan()) return;

    console.log('Inicializando CardForm com iframe: false');

    // No modo iframe: false, o estilo é controlado pelo CSS/Tailwind do seu HTML,
    // mas o MP ainda aceita um objeto style vazio ou básico.
    const mpStyle = {
      base: { color: '#333' }, 
    };

    this.cardFormInstance = this.mpInstance.cardForm({
      amount: this.selectedPlan()!.price.toString(),
      iframe: false,
      style: mpStyle,
      form: {
        id: 'form-checkout',
        cardholderName: { id: 'form-checkout-cardholderName' },
        cardNumber: { id: 'form-checkout-cardNumber' },
        cardExpirationMonth: { id: 'form-checkout-cardExpirationMonth' },
        cardExpirationYear: { id: 'form-checkout-cardExpirationYear' },
        securityCode: { id: 'form-checkout-securityCode' },
        identificationType: { id: 'form-checkout-identificationType' },
        identificationNumber: { id: 'form-checkout-identificationNumber' },
        issuer: { id: 'form-checkout-issuer' },
        installments: { id: 'form-checkout-installments' },
      },
      callbacks: {
        onFormMounted: (error: any) => {
          if (error) console.warn('Formulário falhou ao montar.', error);
          // Popula os selects necessários (Documento, Parcelas, Emissor)
          this.fetchAndPopulateIdentificationTypes();
          // Se necessário, chame getIssuers/getInstallments aqui também se o MP não fizer auto
        },
        onPaymentMethodsReceived: (error: any, paymentMethods: any[]) => {
          if (error) {
             console.warn('Erro bandeira:', error);
             this.cardBrand.set(null);
             return;
          }
          if (paymentMethods && paymentMethods.length > 0) {
            this.cardBrand.set(paymentMethods[0].id);
            this.cardBrand.set(paymentMethods[0].name);
          } else {
            this.cardBrand.set(null);
          }
        },
        // O callback onBinChange é chamado pelo MP quando ele detecta os primeiros dígitos
        onBinChange: (bin: string) => {
          if (bin) {
            const first4 = bin.substring(0, 4);
            const next2 = bin.substring(4, 6);
            this.cardBin.set(`${first4} ${next2}•• •••• ••••`);
          } else {
            this.cardBin.set('•••• •••• •••• ••••');
          }
        },
        onValidityChange: (error: any, field: string) => {
          const input = document.getElementById(`form-checkout-${field}`);
          if (input) {
            if (error) {
                input.classList.add('border-red-500', 'focus:border-red-500');
                input.classList.remove('border-zinc-200', 'focus:border-indigo-500');
            } else {
                input.classList.remove('border-red-500', 'focus:border-red-500');
                input.classList.add('border-zinc-200', 'focus:border-indigo-500');
            }
          }
        },
        onError: (error: any) => {
          console.error('Erro MP:', error);
          this.isSubmitting.set(false);
        },
        onSubmit: (event: Event) => {
          event.preventDefault();
          this.submitSubscription();
        },
      },
    });
  }

  private fetchAndPopulateIdentificationTypes(): void {
    if (!this.cardFormInstance) return;
    this.cardFormInstance.getIdentificationTypes(
      (status: string, response: any) => {
        if (status === '200' && response.length > 0) {
          const select = document.getElementById('form-checkout-identificationType') as HTMLSelectElement;
          if (select) {
            // Limpa opções anteriores para evitar duplicação se remontar
            select.innerHTML = ''; 
            response.forEach((type: any) => {
              const option = document.createElement('option');
              option.value = type.id;
              option.text = type.name;
              select.appendChild(option);
            });
          }
        } else {
          console.error('Falha ao carregar tipos de identificação:', response);
        }
      }
    );
  }

  // --- Inputs do Usuário ---

  public onInputName(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.cardName.set(val.toUpperCase());
    this.cardFlipped.set(false);
  }

  public onInputNumber(event: Event): void {
    let val = (event.target as HTMLInputElement).value;
    // Remove tudo que não é dígito
    val = val.replace(/\D/g, '');
    // Formata visualmente: 0000 0000 0000 0000
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardNumber.set(formatted);
    this.cardFlipped.set(false);
    
    // Opcional: Se você quiser atualizar a bandeira manualmente conforme digita, 
    // pode chamar lógica extra aqui, mas o onPaymentMethodsReceived do MP já cuida disso.
  }

  public onInputMonth(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.cardMonth.set(val);
    this.cardFlipped.set(false);
  }

  public onInputYear(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.cardYear.set(val.slice(-2)); // Pega os 2 últimos dígitos
    this.cardFlipped.set(false);
  }

  public onInputCvv(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.cardCvv.set(val);
    this.cardFlipped.set(true);
  }

  public focusFront(): void { this.cardFlipped.set(false); }
  public focusBack(): void { this.cardFlipped.set(true); }

  public async submitSubscription(): Promise<void> {
    const planId = this.selectedPlan()?.id;
    if (this.isSubmitting() || !this.cardFormInstance || !planId) return;

    this.isSubmitting.set(true);

    try {
      const response = await this.cardFormInstance.createCardToken();
      
      if (!response || !response.token) {
         throw new Error('Token não gerado. Verifique os dados.');
      }

      const command: CreateSubscriptionDTO = {
        planId: planId,
        cardToken: response.token,
      };

      const data = await firstValueFrom(this.subscriptionService.create(command));
      if (data) {
        this.closePaymentModal();
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.error(`Erro ao assinar`, error);
      alert(`Erro: ${error.message || 'Verifique os dados do cartão.'}`);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}