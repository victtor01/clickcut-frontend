import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Booking } from '@app/core/models/Booking';
import { BookingsService } from '@app/core/services/booking.service';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br'; // Importa a localização pt-br
import { firstValueFrom } from 'rxjs';

dayjs.locale('pt-br'); 

interface MonthFilter {
  label: string;
  startAt: string;
  endAt: string;
  icon: string; // Ícone do Material Icons
}

@Component({
  selector: 'app-booking-search-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './booking-search.component.html',
})
export class BookingSearchModalComponent implements OnInit {
  // --- Injeção de Dependências ---
  private readonly dialogRef = inject(MatDialogRef<BookingSearchModalComponent>);
  private readonly bookingsService = inject(BookingsService);

  // --- Estado do Componente ---
  public activeFilter = signal<MonthFilter | null>(null);
  public quickAccessFilters = signal<MonthFilter[]>([]);
  public periodFilters = signal<MonthFilter[]>([]);
  public previousMonthFilters = signal<MonthFilter[]>([]);

  public searchResults = signal<Booking[]>([]);
  public isSidebarOpen = signal(false);

  ngOnInit(): void {
    this.setupFilters(); // Configura todos os filtros
    this.searchBookings(); // Dispara a busca inicial com o filtro padrão (Hoje)
  }

  /**
   * Configura e gera todas as opções de filtro para a sidebar.
   */
  private setupFilters(): void {
    const now = dayjs();

    // --- Grupo 1: Acesso Rápido ---
    const todayFilter: MonthFilter = {
      label: 'Hoje',
      startAt: now.startOf('day').toISOString(),
      endAt: now.endOf('day').toISOString(),
      icon: 'today',
    };
    
    const yesterdayFilter: MonthFilter = {
      label: 'Ontem',
      startAt: now.subtract(1, 'day').startOf('day').toISOString(),
      endAt: now.subtract(1, 'day').endOf('day').toISOString(),
      icon: 'history',
    };
    
    const futureFilter: MonthFilter = {
      label: 'Futuros',
      startAt: now.endOf('day').toISOString(), // Começa a partir de agora
      endAt: '', // String vazia para "sem data de fim" (o backend deve entender isso)
      icon: 'event_upcoming',
    };
    
    this.quickAccessFilters.set([futureFilter, todayFilter, yesterdayFilter]);

    const last7DaysFilter: MonthFilter = {
      label: 'Últimos 7 dias',
      startAt: now.subtract(6, 'day').startOf('day').toISOString(), // 6 dias atrás + hoje = 7
      endAt: now.endOf('day').toISOString(),
      icon: 'date_range',
    };

    const thisMonthFilter: MonthFilter = {
      label: 'Este Mês',
      startAt: now.startOf('month').toISOString(),
      endAt: now.endOf('month').toISOString(),
      icon: 'calendar_month',
    };
    this.periodFilters.set([last7DaysFilter, thisMonthFilter]);

    // --- Grupo 3: Meses Anteriores ---
    const months: MonthFilter[] = [];
    for (let i = 1; i <= 6; i++) {
      const date = now.subtract(i, 'month');
      const monthLabel = date.format('MMMM [de] YYYY'); // ex: "outubro de 2025"

      months.push({
        label: monthLabel,
        startAt: date.startOf('month').toISOString(),
        endAt: date.endOf('month').toISOString(),
        icon: 'calendar_today',
      });
    }
    this.previousMonthFilters.set(months);

    // Define o filtro padrão
    this.activeFilter.set(todayFilter);
  }

  /**
   * Executa a busca no backend com base no filtro ativo.
   */
  public async searchBookings(): Promise<void> {
    const filter = this.activeFilter();
    if (!filter) return;

    console.log('Buscando com filtro:', filter);

    const bookings = await firstValueFrom(
      this.bookingsService.search({
        startAt: filter.startAt,
        endAt: filter.endAt,
        page: 1,
        pageSize: 20,
      }),
    );

    console.log(bookings)

    this.searchResults.set(bookings.items);
  }

  /**
   * Define o filtro ativo e dispara a busca.
   */
  public selectFilter(filter: MonthFilter): void {
    this.activeFilter.set(filter);
    this.isSidebarOpen.set(false);
    this.searchBookings(); 
  }

  public getFilterClasses(filter: MonthFilter): string {
    const baseClasses =
      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors';

    if (this.activeFilter()?.label === filter.label) {
      // Classes para o filtro ATIVO
      return `${baseClasses} bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400`;
    }
    // Classes para filtros INATIVOS
    return `${baseClasses} text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800`;
  }

  public toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }

  close(): void {
    this.dialogRef.close();
  }
}
