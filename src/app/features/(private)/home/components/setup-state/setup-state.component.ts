import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
	BusinessSetupItem,
	BusinessSetupStep,
	StepType,
} from '@app/core/DTOs/business-setup-state.response';
import { BusinessService } from '@app/core/services/business.service';
import { firstValueFrom } from 'rxjs';

export interface StepConfig {
  id: BusinessSetupStep;
  label: string;
  description: string;
  icon: string;
  route: string;
}

export const BUSINESS_STEPS_CONFIG: StepConfig[] = [
  {
    id: BusinessSetupStep.GeneralInfo,
    label: 'Informações Básicas',
    description: 'Nome, @usuario e telefone de contato',
    icon: 'id-card',
    route: '/configure/business',
  },
  {
    id: BusinessSetupStep.Address,
    label: 'Localização',
    description: 'Onde seus clientes podem te encontrar',
    icon: 'map-pin',
    route: '/configure/business/address',
  },
	{
		id: BusinessSetupStep.Visuals,
		label: 'Identidade Visual',
		description: 'Logo e Banner para um perfil profissional',
		icon: 'image',
		route: '/configure/business',
	},
  {
    id: BusinessSetupStep.OperatingHours,
    label: 'Horários de Atendimento',
    description: 'Defina quando sua agenda está aberta',
    icon: 'clock',
    route: '/configure/business/times',
  },
  {
    id: BusinessSetupStep.Services,
    label: 'Serviços e Preços',
    description: 'Cadastre pelo menos um serviço',
    icon: 'scissors',
    route: '/services',
  },
];

// Interface interna para o template
interface UiStep extends StepConfig {
  isCompleted: boolean;
  isCritical: boolean;
  isRecommended: boolean;
}

@Component({
  selector: 'app-setup-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './setup-state.component.html',
})
export class SetupStateComponent implements OnInit {
  private readonly businessService = inject(BusinessService);
  private readonly pendingItems = signal<BusinessSetupItem[]>([]);

  public readonly uiSteps = computed<UiStep[]>(() => {
    const pending = this.pendingItems();

    return BUSINESS_STEPS_CONFIG.map((config) => {
      const pendingItem = pending.find((p) => p.step === config.id);
      const isCompleted = !pendingItem; // Se não está na lista de pendentes, está feito!

      return {
        ...config,
        isCompleted,
        isCritical: pendingItem?.type === StepType.CRITICAL,
        isRecommended: pendingItem?.type === StepType.RECOMMENDED,
      };
    });
  });

  public readonly progress = computed(() => {
    const steps = this.uiSteps();
    if (steps.length === 0) return 0;
    const completed = steps.filter((s) => s.isCompleted).length;
    return Math.round((completed / steps.length) * 100);
  });

  public async ngOnInit(): Promise<void> {
    try {
      const response = await firstValueFrom(this.businessService.getBusinessSetupState());
			this.pendingItems.set(response as any);
    } catch (e) {
      console.error('Erro ao carregar estado do setup', e);
    }
  }
}
