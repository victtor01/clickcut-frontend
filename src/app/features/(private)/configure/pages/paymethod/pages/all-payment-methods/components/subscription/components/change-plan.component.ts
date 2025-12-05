import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentMethod } from '@app/core/models/PaymentMethod';
import { Subscription, SubscriptionPlan } from '@app/core/models/Subscription';

interface DisplayPlan {
  id: SubscriptionPlan;
  name: string;
  price: number;
  stores: string;
  members: string;
  appointments: string;
}

interface PaymentSelection {
  id: string; // ID do PaymentMethod ou 'new'
  type: 'existing' | 'new';
}

@Component({
  templateUrl: './change-plan.component.html',
  imports: [CommonModule],
})
export class ChangePlanComponent {
  private dialogData = inject<{ currentSubscription: Subscription }>(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<ChangePlanComponent>);

  // Estados e Dados
  currentSubscription: Subscription | null = this.dialogData?.currentSubscription || null;
  selectedNewPlan: DisplayPlan | null = null;
  isSubmitting: boolean = false;

  paymentMethod: PaymentSelection | null = null;

  // Simulação de cartões salvos usando a interface PaymentMethod
  savedCards: PaymentMethod[] = [
    {
      id: 'card_1',
      brand: 'Visa',
      lastFourDigits: '4242',
      holderName: 'JOAO SILVA',
      isDefault: true,
      expirationMonth: 10,
      expirationYear: 27,
    },
    {
      id: 'card_2',
      brand: 'Mastercard',
      lastFourDigits: '5555',
      holderName: 'MARIA SANTOS',
      isDefault: false,
      expirationMonth: 5,
      expirationYear: 26,
    },
  ];

  // Detalhes dos Planos para o UI
  plans: DisplayPlan[] = [
    {
      id: 'solo',
      name: 'Solo',
      price: 37,
      stores: '1 Loja',
      members: '1 Profissional (Dono)',
      appointments: '150 Agendamentos',
    },
    {
      id: 'equipe',
      name: 'Equipe',
      price: 67,
      stores: '2 Lojas',
      members: '10 Membros',
      appointments: '500 Agendamentos',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 90,
      stores: '4 Lojas',
      members: 'Membros Ilimitados',
      appointments: 'Agendamentos Ilimitados',
    },
  ];

  constructor() {
    // Definir o plano atual para que o usuário saiba qual está usando
    const currentPlanId = this.currentSubscription?.planId;
    if (currentPlanId) {
      // Encontra o plano atual para display
      // this.currentPlanDetails = this.plans.find(p => p.id === currentPlanId) || null;
    }

    // Pré-selecionar o cartão default ou o primeiro salvo, se houver
    const defaultCard = this.savedCards.find((c) => c.isDefault) || this.savedCards[0];
    if (defaultCard) {
      this.paymentMethod = { id: defaultCard.id, type: 'existing' };
    }
  }

  // --- Lógica de Ação ---

  selectPlan(planId: SubscriptionPlan) {
    const plan = this.plans.find((p) => p.id === planId);
    if (plan) {
      this.selectedNewPlan = plan;
    }
  }

  selectPaymentMethod(id: string) {
    this.paymentMethod = { id: id, type: id === 'new' ? 'new' : 'existing' };
  }

  // Simulação da Chamada de API
  confirmChange() {
    if (!this.selectedNewPlan || !this.paymentMethod) return;

    // Simulação de Submissão
    this.isSubmitting = true;

    console.log(`Tentando mudar para o Plano ${this.selectedNewPlan.name}`);
    console.log(`Usando método de pagamento: ${this.paymentMethod.id}`);

    // Simulação de requisição
    setTimeout(() => {
      this.isSubmitting = false;
      // Em caso de sucesso
      this.dialogRef.close({ success: true, newPlan: this.selectedNewPlan?.id });
    }, 2000);
  }

  // Função utilitária para formatar a data (opcional, mas bom para display)
  formatExpiry(month: number, year: number): string {
    const paddedMonth = month.toString().padStart(2, '0');
    return `${paddedMonth}/${year % 100}`;
  }
}
