import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Business } from '@app/core/models/Business';
import { BusinessService } from '@app/core/services/business.service';
import { filter } from 'rxjs';

@Component({
  template: `
    <section class="flex flex-col px-6">
      <h2 class="text-3xl font-bold mb-2 dark:text-gray-100 text-gray-500">Seus Links</h2>
      <p class="text-gray-500 dark:text-gray-400">
        Defina os horários que seu negócio estará aberto
      </p>

      <div
        class="border rounded-xl bg-white dark:bg-gray-900/50 dark:border-gray-800 border-gray-200/80 mt-8"
      >
        <div class="p-6">
          <h3 class="text-lg font-semibold saira-font text-gray-500 dark:text-gray-100">
            Link de Agendamento
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Este é o link público que seus clientes usarão para agendar horários.
          </p>
        </div>

        <div class="p-6 border-t dark:border-gray-800 border-gray-200/80">
          <label for="appointmentLink" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Compartilhe seu link
          </label>
          <div class="relative mt-2">
            <!-- Input que exibe o link (apenas leitura) -->
            <input
              id="appointmentLink"
              type="text"
              [value]="appointmentLink"
              readonly
              (click)="copyLink()"
              class="w-full cursor-pointer rounded-lg border border-gray-300 bg-stone-100 py-2.5 pl-4 pr-28 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />

            <!-- Botão para copiar -->
            <button
              type="button"
              (click)="copyLink()"
              class="absolute inset-y-0 right-0 my-1.5 mr-1.5 flex items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-300 transition-all hover:bg-stone-100 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600"
              [ngClass]="{ 'text-blue-500 dark:text-blue-400': copyState === 'copied' }"
            >
              @if (copyState === 'idle') {
                <i class="material-icons-outlined !text-base">content_copy</i>
                <span>Copiar</span>
              }
              @if (copyState === 'copied') {
                <i class="material-icons-outlined !text-base">done</i>
                <span>Copiado!</span>
              }
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  imports: [CommonModule],
})
export class BusinessLinksComponent implements OnInit {
  public appointmentLink = '';
  public copyState: 'idle' | 'copied' = 'idle';
  public business?: Business;

  private readonly destroyRef = inject(DestroyRef);
  private readonly businessService = inject(BusinessService);

  public ngOnInit(): void {
    this.businessService.loadBusinessSession().subscribe();

    this.businessService.businessSession$
      .pipe(
        filter((business): business is Business => business !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((business) => {
        this.business = business;
        this.setupAppointmentLink();
      });
  }

  private setupAppointmentLink(): void {
    if (this.business?.id) {
      this.appointmentLink = `${window.location.origin}/appointments/${this.business.id}`;
    }
  }

  public copyLink = () => {
    if (!this.appointmentLink) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.appointmentLink).catch((err) => {
        console.error('Falha ao copiar com a API moderna, tentando método legado.', err);
        this.copyLegacy();
      });
    } else {
      this.copyLegacy();
    }

    this.copyState = 'copied';

    setTimeout(() => {
      this.copyState = 'idle';
    }, 5000);
  };

  /**
   * Método de fallback para copiar texto em navegadores mais antigos.
   */
  private copyLegacy() {
    const textArea = document.createElement('textarea');
    textArea.value = this.appointmentLink;

    // Esconde o textarea da tela
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        console.error('Falha ao executar o comando de cópia legado.');
      }
    } catch (err) {
      console.error('Erro ao tentar copiar com o método legado: ', err);
    }

    document.body.removeChild(textArea);
  }
}
