import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MemberPerformanceResponse } from '@app/core/DTOs/members-performace-response';
import { MembersService } from '@app/core/services/members.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';

interface DailyStat {
  day: string; // "Dom", "Seg", etc.
  count: number;
  heightPercent: number;
}

interface MemberUI {
  id: string;
  initial: string;
  name: string;
  role: string;
  revenue: number;
  avatarUrl?: string | null;
  stats: DailyStat[];
  totalWeek: number;
}

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ToFormatBrlPipe, RouterModule],
  templateUrl: './members.component.html',
})
export class MembersComponent implements OnInit {
  public searchQuery = signal('');
  public members = signal<MemberUI[]>([]);
  public isLoading = signal(true);

  private membersService = inject(MembersService);

  public filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.members().filter(
      (m) => m.name.toLowerCase().includes(query) || m.role.toLowerCase().includes(query),
    );
  });

  ngOnInit() {
    this.fetchData();
  }

  /**
   * Busca os dados reais da API e os mapeia para a UI.
   */
  async fetchData() {
    this.isLoading.set(true);

    // Define o período da "semana atual" (de Domingo a Sábado)
    const start = dayjs().startOf('week');
    const end = dayjs().endOf('week');

    try {
      const data: MemberPerformanceResponse[] = await firstValueFrom(
        this.membersService.getPerformace(start, end),
      );

      // 2. Mapeia a resposta da API para a interface da UI
      const uiData = data.map((m) => this.mapToUI(m));
      this.members.set(uiData);
    } catch (error) {
      console.error('Erro ao buscar dados da performance:', error);
      this.members.set([]); // Limpa em caso de erro
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapToUI(data: MemberPerformanceResponse): MemberUI {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const maxCount = Math.max(...data.dailyStats.map((s) => s.bookingCount), 1);

    const stats = data.dailyStats.map((stat, index) => ({
      day: days[index],
      count: stat.bookingCount,
      heightPercent:
        stat.bookingCount === 0 ? 4 : Math.max((stat.bookingCount / maxCount) * 100, 4),
    }));

    return {
      id: data.memberId,
      initial: data.fullName[0].toUpperCase(),
      name: data.fullName,
      role: data.roleName,
      avatarUrl: data.avatarUrl,
      stats: stats,
      revenue: data.revenue,
      totalWeek: data.totalBookings,
    };
  }
}
