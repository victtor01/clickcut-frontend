import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'; // Se usar ícones
import { BUSINESS_DATA } from '../default/default-layout.component';

@Component({
  selector: 'minimal-layout-phone',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="w-full h-full flex flex-col relative font-sans bg-white text-zinc-900 overflow-hidden"
    >
      <div
        class="absolute inset-0 z-0 opacity-[0.4]"
        style="background-image: radial-gradient(#e4e4e7 1px, transparent 1px); background-size: 24px 24px;"
      ></div>

      <div class="relative mt-5 z-10 flex flex-col items-center pt-8 pb-2 px-6">
        <div
          class="w-14 h-14 rounded-2xl p-0.5 border border-zinc-100 bg-white shadow-lg shadow-zinc-200/50 mb-3 rotate-3"
        >
          <div
            class="w-full h-full rounded-[14px] overflow-hidden bg-zinc-50 grid place-items-center"
          >
            @if (data?.business?.logoUrl) {
              <img [src]="data?.business?.logoUrl" class="w-full h-full object-cover" />
            } @else {
              <span class="font-bold text-lg text-zinc-400">CY</span>
            }
          </div>
        </div>

        <h2 class="text-lg font-bold tracking-tight text-zinc-900 leading-none">
          {{ data?.business?.name }}
        </h2>
        <p class="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.15em] mt-1.5">
          {{ data?.business?.handle }}
        </p>
      </div>

      <div class="w-12 h-[1px] bg-zinc-200 mx-auto my-3 relative z-10"></div>

      <div class="relative z-10 px-6 pb-4 flex flex-col items-center text-center">
        <div
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-white mb-2 shadow-md"
        >
          <div class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
          <span class="text-[9px] font-bold uppercase tracking-wider">Agenda Aberta</span>
        </div>

        <h3 class="text-3xl font-bold text-zinc-900 capitalize leading-none tracking-tight">
          {{ data?.date?.format('dddd') }}
        </h3>
        <span class="text-sm text-zinc-500 font-medium mt-0.5">
          Dia {{ data?.date?.format('DD') }}
        </span>
      </div>

      <div class="flex-1 px-6 relative z-10 overflow-hidden">
        @if (data?.loading) {
          <div class="flex items-center justify-center h-full">
            <span class="text-zinc-400 text-xs uppercase tracking-widest animate-pulse"
              >Carregando...</span
            >
          </div>
        } @else {
          <div class="grid grid-cols-3 gap-2.5 content-start">
            @for (slot of availableSlots.slice(0, 8); track slot) {
              <div
                class="flex items-center justify-center rounded-lg py-2.5 font-semibold text-sm bg-white border border-zinc-200 text-zinc-800 shadow-sm shadow-zinc-200/50"
              >
                {{ slot }}
              </div>
            }

            @if (availableSlots.length > 8) {
              <div
                class="flex items-center justify-center rounded-lg py-2.5 font-bold text-sm bg-zinc-50 text-zinc-400 border border-zinc-200 border-dashed"
              >
                +{{ availableSlots.length - 8 }}
              </div>
            }

            @if (availableSlots.length === 0) {
              <div
                class="col-span-3 text-center py-8 text-zinc-400 text-sm bg-zinc-50 rounded-xl border border-zinc-100 border-dashed"
              >
                Sem horários hoje
              </div>
            }
          </div>
        }
      </div>

      <div class="mt-auto pb-6 pt-2 text-center relative z-10">
        <div class="mt-auto pt-4 text-center">
          <div class="mb-1 flex justify-center text-indigo-400">
            @switch (data?.ctaType) {
              @case ('bio') {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="animate-bounce"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              }

              @case ('whatsapp') {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="animate-pulse"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                  />
                </svg>
              }

              @case ('direct') {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              }

              @case ('website') {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              }
            }
          </div>

          <p class="font-bold text-base text-white">{{ data?.ctaText }}</p>
          <p class="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">
            {{ data?.ctaType === 'whatsapp' ? 'Responderemos rápido' : 'Agende pelo App' }}
          </p>
        </div>
      </div>
    </div>
  `,
})
export class MinimalMarketingLayoutComponent {
  @Input() public data?: BUSINESS_DATA;

  public get availableSlots() {
    return this.data?.availableSlots || [];
  }
}
