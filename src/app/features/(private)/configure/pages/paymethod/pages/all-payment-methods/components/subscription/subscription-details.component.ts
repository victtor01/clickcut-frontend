import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '@app/core/models/Subscription';
import { UsersService } from '@app/core/services/users.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-subscription',
  imports: [CommonModule, MatIconModule, RouterLink, DatePipe],
  templateUrl: './subscription-details.component.html',
})
export class MySubscriptionComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  public readonly subscription = signal<Subscription | null>(null);
  public readonly isLoading = signal(true);

  ngOnInit(): void {
    this.fetchSubscription();
  }

  private async fetchSubscription(): Promise<void> {
    try {
      this.isLoading.set(true);
      const subscription = await firstValueFrom(this.usersService.getSubscription());
      this.subscription.set(subscription);
    } catch (error) {
      console.error('Erro ao buscar assinatura', error);
      // Se der erro ou for null, assumimos null (o template trata como plano inativo/grátis se quiser)
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- UI Helpers ---

  public getPlanLabel(plan: SubscriptionPlan): string {
    const labels: Record<string, string> = {
      solo: 'Plano Solo',
      equipe: 'Plano Equipe',
      pro: 'Plano Pro',
    };
    return labels[plan] || plan;
  }

  public getStatusLabel(status: SubscriptionStatus): string {
    const labels: Record<string, string> = {
      Active: 'Ativo',
      Pending: 'Pendente',
      PastDue: 'Pagamento Atrasado',
      Cancelled: 'Cancelado',
    };
    return labels[status] || status;
  }

  public getCardGradient(plan: SubscriptionPlan): string {
    switch (plan) {
      case 'pro':
        return 'from-violet-600 to-fuchsia-700 shadow-violet-500/30 dark:from-violet-900 dark:to-fuchsia-900 dark:shadow-fuchsia-900/40 dark:border dark:border-white/10';
      
      case 'equipe':
        // Light: Azul vibrante | Dark: Azul noturno
        return 'from-indigo-600 to-blue-600 shadow-indigo-500/30 dark:from-sky-900 dark:to-blue-900 dark:shadow-sky-800/40 dark:border dark:border-white/10';
      
      default: // Solo
        // Light: Cinza Metálico | Dark: Preto "Stealth" (quase fundindo com o fundo, mas destacado pela borda)
        return 'from-gray-500 to-gray-600 shadow-gray-500/30 dark:from-gray-800 dark:to-gray-950 dark:shadow-black/50 dark:border dark:border-gray-700';
    }
  }

  public getStatusBadgeColor(status: SubscriptionStatus): string {
    switch (status) {
      case 'Active':
        return 'bg-green-400/20 text-green-200 border-green-400/30';
      case 'PastDue':
        return 'bg-red-400/20 text-red-200 border-red-400/30 animate-pulse';
      case 'Pending':
        return 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30';
      default:
        return 'bg-white/20 text-white border-white/30';
    }
  }
}
