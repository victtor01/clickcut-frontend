import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BUSINESS_DATA } from '../default/default-layout.component';

@Component({
  selector: 'sunset-layout-phone',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="w-full h-full flex flex-col relative font-sans text-white overflow-hidden bg-orange-500"
    >
      <!-- Fundo Gradiente Quente -->
      <div
        class="absolute inset-0 z-0 bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600"
      ></div>

      <!-- Elementos Decorativos (Círculos) -->
      <div
        class="absolute top-[-10%] right-[-20%] w-64 h-64 rounded-full bg-yellow-300 blur-[60px] opacity-40 z-0"
      ></div>
      <div
        class="absolute bottom-[10%] left-[-10%] w-72 h-72 rounded-full bg-purple-800 blur-[80px] opacity-40 z-0"
      ></div>

      <!-- Conteúdo -->
      <div class="relative z-10 flex flex-col h-full p-6 pt-10">
        <!-- Header: Esquerda -->
        <div class="flex items-center gap-4 mb-8">
          <div
            class="w-16 h-16 rounded-2xl shadow-lg bg-white/10 backdrop-blur-md border border-white/20 p-1"
          >
            @if (data?.business?.logoUrl) {
              <img [src]="data?.business?.logoUrl" class="w-full h-full object-cover rounded-xl" />
            } @else {
              <div class="w-full h-full rounded-xl bg-white/10 grid place-items-center font-bold">
                CY
              </div>
            }
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Agende em</p>
            <h2 class="text-2xl font-extrabold leading-none">{{ data?.business?.name }}</h2>
          </div>
        </div>

        <!-- Data Grande -->
        <div class="mb-6">
          <h1
            class="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80"
            style="-webkit-text-stroke: 1px rgba(255,255,255,0.1);"
          >
            {{ data?.date?.format('dddd') }}
          </h1>
          <div class="flex items-center gap-3 mt-2">
            <div class="h-1 w-10 bg-yellow-400 rounded-full"></div>
            <span class="text-lg font-bold">{{ data?.date?.format('DD [de] MMMM') }}</span>
          </div>
        </div>

        <!-- Grid de Horários (Pílulas Arredondadas) -->
        <div class="flex-1">
          @if (data?.loading) {
            <div class="h-full flex items-center justify-center">
              <mat-icon class="animate-spin">sync</mat-icon>
            </div>
          } @else {
            <div class="grid grid-cols-3 gap-3 content-start">
              @for (slot of availableSlots.slice(0, 11); track slot) {
                <div
                  class="flex items-center justify-center rounded-full py-2.5 font-bold text-sm bg-white text-rose-600 shadow-lg shadow-rose-900/20 border-2 border-transparent hover:scale-105 transition-transform"
                >
                  {{ slot }}
                </div>
              }
              @if (availableSlots.length > 11) {
                <div
                  class="flex items-center justify-center rounded-full py-2.5 font-bold text-sm bg-white/20 border-2 border-white/30 text-white"
                >
                  +{{ availableSlots.length - 11 }}
                </div>
              }
              @if (availableSlots.length === 0) {
                <div
                  class="col-span-3 p-4 bg-white/10 rounded-xl text-center backdrop-blur-md border border-white/10"
                >
                  Sem horários hoje 😔
                </div>
              }
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="mt-auto pt-4 text-center">
          <div class="mt-auto pt-4 text-center">
            <div class="mb-1 flex justify-center text-white">
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
            <p class="text-[10px] text-zinc-200 uppercase tracking-wider mt-1">
              {{ data?.ctaType === 'whatsapp' ? 'Responderemos rápido' : 'Agende pelo App' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SunsetMarketingLayoutComponent {
  @Input() public data?: BUSINESS_DATA;
  public get availableSlots() {
    return this.data?.availableSlots || [];
  }
}
