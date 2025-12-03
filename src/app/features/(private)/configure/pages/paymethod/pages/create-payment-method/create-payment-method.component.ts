import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { CreatePaymentMethodDTO } from '@app/core/schemas/create-payment-method.dto';
import { PaymentMethodService } from '@app/core/services/payment-method.service';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';

declare var MercadoPago: any;

@Component({
  templateUrl: './create-payment-method.component.html',
  styleUrls: ['./create-payment-method.component.scss'],
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule],
})
export class CreatePaymentMethodComponent {
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly router = inject(Router);

  public isSubmitting = signal(false);
  public cardFlipped = signal(false);

  // Sinais visuais
  public cardName = signal('');
  public cardNumber = signal('');
  public cardMonth = signal('');
  public cardYear = signal('');
  public cardCvv = signal('');
  public cardBrand = signal<string | null>(null);
  public cardBin = signal<string>('•••• •••• •••• ••••');

  private mpInstance: any;
  private cardFormInstance: any;

  ngOnInit(): void {
    const publicKey = environment.mercadoPagoPublicKey;
    this.mpInstance = new MercadoPago(publicKey, { locale: 'pt-BR' });
  }

  // MUDANÇA 1: Usar ngAfterViewInit para garantir que os inputs HTML existam
  ngAfterViewInit(): void {
    this.initializeCardForm();
  }

  ngOnDestroy(): void {
    this.destroyCardForm();
  }

  private destroyCardForm(): void {
    if (this.cardFormInstance) {
      this.cardFormInstance.unmount();
      this.cardFormInstance = null;
    }
  }

  private initializeCardForm(): void {
    if (!this.mpInstance) return;

    console.log('Inicializando CardForm para Tokenização (Sem valor)');

    this.cardFormInstance = this.mpInstance.cardForm({
      amount: '1',
      iframe: false,
      style: {
        base: { color: '#333' },
      },
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
          if (error) console.warn('Erro ao montar formulário:', error);
          this.fetchAndPopulateIdentificationTypes();
        },
        onPaymentMethodsReceived: (error: any, paymentMethods: any[]) => {
          if (error) {
            this.cardBrand.set(null);
            return;
          }
          if (paymentMethods && paymentMethods.length > 0) {
            this.cardBrand.set(paymentMethods[0].name);
            // Opcional: Pegar a logo/thumbnail se quiser exibir
          } else {
            this.cardBrand.set(null);
          }
        },
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
          this.saveCard();
        },
      },
    });
  }

  private fetchAndPopulateIdentificationTypes(): void {
    if (!this.cardFormInstance) return;
    this.cardFormInstance.getIdentificationTypes((status: string, response: any) => {
      if (status === '200' && response.length > 0) {
        const select = document.getElementById(
          'form-checkout-identificationType',
        ) as HTMLSelectElement;
        if (select) {
          select.innerHTML = '';
          response.forEach((type: any) => {
            const option = document.createElement('option');
            option.value = type.id;
            option.text = type.name;
            select.appendChild(option);
          });
        }
      }
    });
  }

  // --- Inputs Visuais (Mantidos iguais) ---
  public onInputName(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.cardName.set(val.toUpperCase());
    this.cardFlipped.set(false);
  }

  public onInputNumber(event: Event): void {
    let val = (event.target as HTMLInputElement).value;
    val = val.replace(/\D/g, '');
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardNumber.set(formatted);
    this.cardFlipped.set(false);
  }

  public onInputMonth(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.cardMonth.set(val);
    this.cardFlipped.set(false);
  }

  public onInputYear(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.cardYear.set(val.slice(-2));
    this.cardFlipped.set(false);
  }

  public onInputCvv(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.cardCvv.set(val);
    this.cardFlipped.set(true);
  }

  public focusFront(): void {
    this.cardFlipped.set(false);
  }
  public focusBack(): void {
    this.cardFlipped.set(true);
  }

  // MUDANÇA 4: Renomeado para refletir a ação real (Salvar Cartão)
  public async saveCard(): Promise<void> {
    if (this.isSubmitting() || !this.cardFormInstance) return;

    this.isSubmitting.set(true);

    try {
      // O createCardToken gera o token seguro sem criar cobrança
      const response = await this.cardFormInstance.createCardToken();

      if (!response || !response.token) {
        throw new Error('Token não gerado. Verifique os dados.');
      }

      // Prepara o DTO para o backend
      const command: CreatePaymentMethodDTO = {
        cardToken: response.token, // Ajuste para bater com seu DTO 'CreateCardRequest' do Backend
      };

      await firstValueFrom(this.paymentMethodService.create(command));

      alert('Cartão salvo com sucesso!');
      this.router.navigate(['/configure/plan']);
    } catch (error: any) {
      console.error(`Erro ao salvar cartão`, error);
      alert(`Erro: ${error.message || 'Verifique os dados do cartão.'}`);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
