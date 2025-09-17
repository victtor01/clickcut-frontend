import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BookingHistory } from '@app/core/DTOs/booking-history-response';
import { SummaryService } from '@app/core/services/summary.service';
import { DoughnutChartComponent } from '@app/shared/components/graphics/doughnut-chart/doughnut.component';
import { LineGraph } from '@app/shared/components/graphics/line-graph/line-graph.component';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './home-dashboard.component.html',
  selector: 'home-dashboard',
  imports: [LineGraph, DoughnutChartComponent, CommonModule],
})
export class HomeDashboardComponent implements OnInit {
  private readonly summaryService = inject(SummaryService);

  private _bookingsHistory?: BookingHistory;

  get bookingHistory() {
    return this._bookingsHistory;
  }

  get labels() {
    return this._bookingsHistory?.bookings.map((b) => b.date);
  }

  get values() {
    return this._bookingsHistory?.bookings.map((b) => b.count);
  }

  public ngOnInit(): void {
    this.fetchBookingHistory();
  }

  public async fetchBookingHistory(): Promise<void> {
    this._bookingsHistory = await firstValueFrom(this.summaryService.getBookingHistory());
  }
}
