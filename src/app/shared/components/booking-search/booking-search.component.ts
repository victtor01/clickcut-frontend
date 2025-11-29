import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Booking } from '@app/core/models/Booking';
import { BookingsService } from '@app/core/services/booking.service';
import { bookingStatusMap } from '@app/shared/utils/booking-status';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { saxSearchNormalBold } from '@ng-icons/iconsax/bold';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { debounceTime, distinctUntilChanged, firstValueFrom, tap } from 'rxjs';

dayjs.locale('pt-br');

interface MonthFilter {
  label: string;
  startAt: string;
  endAt: string;
  icon: string;
}

@Component({
  selector: 'app-booking-search-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, RouterModule, NgIcon],
  templateUrl: './booking-search.component.html',
  providers: [
    provideIcons({
      saxSearchNormalBold,
    }),
  ],
})
export class BookingSearchModalComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<BookingSearchModalComponent>);
  private readonly bookingsService = inject(BookingsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  public activeFilter = signal<MonthFilter | null>(null);
  public quickAccessFilters = signal<MonthFilter[]>([]);
  public periodFilters = signal<MonthFilter[]>([]);
  public previousMonthFilters = signal<MonthFilter[]>([]);

  public searchResults = signal<Booking[]>([]);
  public isSidebarOpen = signal(false);

  public searchControl = new FormControl('');
  // <-- ALTERAÇÃO 2: Muda de toSignal para um signal manual
  public searchName = signal('');

  public isLoading = signal(true);

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        tap(() => this.isLoading.set(true)),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.searchName.set(value || '');
      });

    effect(async () => {
      this.isLoading.set(true);

      const filter = this.activeFilter();
      const name = this.searchName(); // <-- ALTERAÇÃO 4: Leitura direta do signal

      if (!filter) return; // Guarda de segurança

      try {
        console.log('Buscando com filtro:', filter.label, 'e nome:', name);
        const bookings = await firstValueFrom(
          this.bookingsService.search({
            startAt: filter.startAt,
            endAt: filter.endAt,
            name: name, // O 'name' agora será reativo
            page: 1,
            pageSize: 20,
          }),
        );
        this.searchResults.set(bookings.items);
      } catch (error) {
        console.error('Erro na busca:', error);
        this.searchResults.set([]);
      } finally {
        this.isLoading.set(false);
      }
    });
  }

  public statusMap = bookingStatusMap;

  ngOnInit(): void {
    this.setupFilters();
  }

  public open(booking: Booking): void {
    this.router.navigate(['/bookings', booking.id]);
    this.close();
  }

  private setupFilters(): void {
    const now = dayjs();

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

    this.activeFilter.set(todayFilter);
  }

  public selectFilter(filter: MonthFilter): void {
    this.activeFilter.set(filter);
    this.isSidebarOpen.set(false);
  }

  public getFilterClasses(filter: MonthFilter): string {
    const baseClasses =
      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors';

    if (this.activeFilter()?.label === filter.label) {
      // Classes para o filtro ATIVO
      return `${baseClasses} bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400`;
    }
    // Classes para filtros INATIVOS
    return `${baseClasses} text-gray-600 hover:bg-stone-100 dark:text-gray-300 dark:hover:bg-gray-800`;
  }

  public toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }

  close(): void {
    this.dialogRef.close();
  }
}
