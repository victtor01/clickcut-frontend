import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BookingHistory } from '@app/core/DTOs/booking-history-response';
import { GeneralHistoryDTO } from '@app/core/DTOs/general-history-response';
import { RevenueHistoryDTO } from '@app/core/DTOs/revenue-history-response';
import { SummaryService } from '@app/core/services/summary.service';
import { DoughnutChartComponent } from '@app/shared/components/graphics/doughnut-chart/doughnut.component';
import { LineGraph } from '@app/shared/components/graphics/line-graph/line-graph.component';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'home-dashboard',
  templateUrl: './home-dashboard.component.html',
  imports: [LineGraph, DoughnutChartComponent, CommonModule, ToFormatBrlPipe],
})
export class HomeDashboardComponent implements OnInit {
  private readonly summaryService = inject(SummaryService);

  private _bookingsHistory?: BookingHistory;
  private _revenue?: RevenueHistoryDTO;
  private _general?: GeneralHistoryDTO

  get bookingHistory() {
    return this._bookingsHistory;
  }

  get revenue() {
    return this._revenue;
  }

  get general() {
    return this._general?.count;
  }

  get labels() {
    return this._bookingsHistory?.bookings.map((b) => b.date);
  }

  get values() {
    return this._bookingsHistory?.bookings.map((b) => b.count);
  }

  get revenuePercentageChange(): number {
    if (!this._revenue || this._revenue.revenueOfLastMonth === 0) {
      return 0;
    }

    const { revenue, revenueOfLastMonth } = this._revenue;
    return ((revenue - revenueOfLastMonth) / revenueOfLastMonth) * 100;
  }

  get isRevenueIncrease(): boolean {
    return this.revenuePercentageChange >= 0;
  }

  public ngOnInit(): void {
    this.fetchBookingHistory();
  }

  public async fetchBookingHistory(): Promise<void> {
    [this._bookingsHistory, this._revenue, this._general] = await Promise.all([
      firstValueFrom(this.summaryService.getBookingHistory()),
      firstValueFrom(this.summaryService.getRevenue()),
      firstValueFrom(this.summaryService.getGeneral())
    ]);

  }
}
