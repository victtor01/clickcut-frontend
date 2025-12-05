import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterModule } from '@angular/router'; // Para o botão de adicionar
import { PaymentMethod } from '@app/core/models/PaymentMethod';
import { PaymentMethodService } from '@app/core/services/payment-method.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-all-payment-methods',
  imports: [CommonModule, MatIconModule, RouterModule, RouterLink],
  templateUrl: './all-payment-methods.component.html',
})
export class AllPaymentMethodsComponent implements OnInit {
  private readonly paymentMethodService = inject(PaymentMethodService);
  
  public readonly paymentMethods = signal<PaymentMethod[]>([]);
  public readonly isLoading = signal(true);

  ngOnInit(): void {
    this.fetchAllPaymentMethods();
  }

  public async setDefaultCard(cardId: string): Promise<void> {
    this.paymentMethods.update(cards => 
      cards.map(c => ({ ...c, isDefault: c.id === cardId }))
    );

    try {
      //  await firstValueFrom(this.paymentMethodService.setDefault(cardId));
       // Sucesso (Toast opcional)
    } catch (error) {
       console.error('Erro ao definir padrão', error);
       // Reverte se der erro (re-busca os dados)
       this.fetchAllPaymentMethods();
    }
  }

  private async fetchAllPaymentMethods(): Promise<void> {
    try {
      this.isLoading.set(true);
      const paymentMethods = await firstValueFrom(this.paymentMethodService.findAll());
      this.paymentMethods.set(paymentMethods);
    } catch (error) {
      console.error('Erro ao buscar cartões', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  public async deleteCard(id: string): Promise<void> {
    if (!confirm('Tem certeza que deseja remover este cartão?')) return;
    
    try {
      // await firstValueFrom(this.paymentMethodService.delete(id));
      // Atualiza a lista localmente após deletar
      this.paymentMethods.update(cards => cards.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erro ao deletar', error);
    }
  }

  // Helper para estilizar o cartão baseado na bandeira
  public getBrandStyle(brand: string): string {
    const b = brand.toLowerCase();
    if (b.includes('visa')) return 'from-blue-600 to-blue-800';
    if (b.includes('master')) return 'from-orange-600 to-red-700';
    if (b.includes('amex')) return 'from-emerald-600 to-teal-700';
    if (b.includes('elo')) return 'from-gray-700 to-gray-900';
    if (b.includes('hipercard')) return 'from-red-600 to-red-800';
    return 'from-indigo-600 to-purple-700'; // Padrão
  }

  public getBrandIcon(brand: string): string {
    // Retorna um ícone do Material Symbols ou texto
    // O ideal seria ter SVGs das bandeiras, mas usaremos texto estilizado ou ícone genérico
    return 'credit_card'; 
  }
}