import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Business } from '@app/core/models/Business';
import { Service } from '@app/core/models/Service';
import { BookingsService } from '@app/core/services/booking.service';
import { BusinessService } from '@app/core/services/business.service';
import { ServicesService } from '@app/core/services/services.service';
import { CalendarPickerComponent } from '@app/shared/components/calendar-picker/calendar-picker.component';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import dayjs, { Dayjs } from 'dayjs';
import { toPng } from 'html-to-image';
import { firstValueFrom } from 'rxjs';
import {
  CtaType,
  DefaultMarketingLayoutComponent,
} from '../components/default/default-layout.component';
import { MinimalMarketingLayoutComponent } from '../components/minimal/minimal-layout.component';
import { SunsetMarketingLayoutComponent } from '../components/susent/susent.component';

type TemplateType = 'default' | 'minimal' | 'sunset';

@Component({
  templateUrl: 'marketing-generator.component.html',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    CalendarPickerComponent,
    ToFormatBrlPipe,
    DefaultMarketingLayoutComponent,
    SunsetMarketingLayoutComponent,
    MinimalMarketingLayoutComponent,
  ],
})
export class MarketingGenerator implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly servicesService = inject(ServicesService);
  private readonly businessService = inject(BusinessService);

  @ViewChild('storyCanvas')
  storyCanvas!: ElementRef;

  public ctaOptions: { type: CtaType; label: string; icon: string }[] = [
    { type: 'bio', label: 'Link na Bio', icon: 'north' },
    { type: 'whatsapp', label: 'Chama no Zap', icon: 'chat' },
    { type: 'direct', label: 'Manda Direct', icon: 'send' },
    { type: 'website', label: 'Acesse o Site', icon: 'language' },
  ];

  // principais estados
  public allServices = signal<Service[]>([]);
  public currentMonth = signal<number>(dayjs().month());
  public currentYear = signal<number>(dayjs().year());
  public availableDays = signal<Set<string>>(new Set());
  public selectedServices = signal<Set<Service>>(new Set());
  public selectedDate = signal<Dayjs | null>(dayjs());
  public availableSlots = signal<string[]>([]);
  public business = signal<Business | null>(null);
  public selectedTemplate = signal<TemplateType>('default');

  public isLoading = signal(false);
  public isGenerating = signal(false);
  public selectedCta = signal(this.ctaOptions[0]);

  constructor() {
    effect(() => {
      if (this.selectedServices().size === 0) {
        this.availableDays.set(new Set());
        this.selectedDate.set(null);
      }
    });

    effect(() => {});
  }

  public get data () {
    return  {
      loading: false,
      availableSlots: this.availableSlots(),
      date: this.selectedDate(),
      ctaText: this.selectedCta().label,
      ctaType: this.selectedCta().type,
      business: {
        name: this.business()?.name,
        handle: this.business()?.profile?.handle,
        logoUrl: this.business()?.profile?.logoUrl,
      },
    };
  }

  ngOnInit() {
    this.fetchServices();
    this.fetchBusiness();
  }

  public selectCta(option: any) {
    this.selectedCta.set(option);
  }

  public async fetchBusiness() {
    const business = await firstValueFrom(this.businessService.getBusinessSession());

    this.business.set(business);
  }

  public async fetchSlots(): Promise<void> {
    this.isLoading.set(true);
    try {
      const date = this.selectedDate();

      const selectedServicesIds = [...this.selectedServices()].map((s) => s.id);

      this.businessService.avaibleTimes(selectedServicesIds, date?.format('YYYY-MM-DD')).subscribe({
        next: (value: string[]) => {
          console.log(value);
          this.availableSlots.set(value);
        },

        error: () => {
          // this.toastService.error('Não foi possível encontrar o serviço!');
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  public toggleService(service: any): void {
    const current = new Set(this.selectedServices()); // Cria uma cópia para imutabilidade

    if (current.has(service)) {
      current.delete(service);
    } else {
      current.add(service);
    }

    this.selectedServices.set(current);

    this.fetchAvailableDays();
  }

  public isSelected(service: Service): boolean {
    return this.selectedServices().has(service);
  }

  public async fetchAvailableDays(): Promise<void> {
    if (this.selectedServices().size === 0) {
      return;
    }

    const year = this.currentYear();
    const month = this.currentMonth();

    const avaibleDays = await firstValueFrom(
      this.bookingsService.avaibleDays(
        year,
        month + 1,
        [...this.selectedServices()].map((s) => s.id),
      ),
    );

    this.availableDays.set(new Set(avaibleDays.map((d) => dayjs(d).format('YYYY-MM-DD'))));
  }

  public async fetchServices(): Promise<void> {
    const services = await firstValueFrom(this.servicesService.getAll());

    this.allServices.set(services);
  }

  public onMonthChanged(offset: number): void {
    this.selectedDate.set(null);
    const newDate = dayjs(new Date(this.currentYear(), this.currentMonth())).add(offset, 'month');
    this.currentYear.set(newDate.year());
    this.currentMonth.set(newDate.month());
    this.fetchAvailableDays();
  }

  public selectTemplate(template: TemplateType) {
    this.selectedTemplate.set(template);
  }

  public onDateSelected(day: Dayjs): void {
    this.selectedDate.set(day);
    this.fetchSlots();
  }

  public async downloadImage() {
    if (this.isGenerating()) return;
    this.isGenerating.set(true);

    try {
      if (!this.storyCanvas || !this.storyCanvas.nativeElement) {
        console.error('ERRO CRÍTICO: Elemento #storyCanvas não encontrado.');
        alert('Erro interno: Elemento da imagem não encontrado.');
        return;
      }

      const element = this.storyCanvas.nativeElement;

      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: '#09090b',
        pixelRatio: 3,
        skipFonts: true,
        filter: (node: HTMLElement) => {
          return node.tagName !== 'LINK';
        },
      });

      // Cria o link de download
      const link = document.createElement('a');
      link.download = `agenda-${this.selectedDate()}.png`;
      link.href = dataUrl;
      link.click();

      // Bônus: Web Share API (Para celular)
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'agenda.png', { type: 'image/png' });

        try {
          await navigator.share({
            files: [file],
            title: 'Agenda Disponível',
            text: 'Confira meus horários livres!',
          });
        } catch (err) {
          console.log('Compartilhamento cancelado');
        }
      }
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      alert('Erro ao gerar imagem. Tente novamente.');
    } finally {
      this.isGenerating.set(false);
    }
  }
}
