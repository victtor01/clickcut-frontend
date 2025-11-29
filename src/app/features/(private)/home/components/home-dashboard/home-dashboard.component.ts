import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BookingHistory } from '@app/core/DTOs/booking-history-response';
import { GeneralHistoryDTO } from '@app/core/DTOs/general-history-response';
import { MethodHistoryDTO } from '@app/core/DTOs/methods-history-response';
import { PopularService } from '@app/core/DTOs/popular-services-response';
import { RevenueHistoryDTO } from '@app/core/DTOs/revenue-history-response';
import { SummaryService } from '@app/core/services/summary.service';
import { DoughnutChartComponent } from '@app/shared/components/graphics/doughnut-chart/doughnut.component';
import { LineGraph } from '@app/shared/components/graphics/line-graph/line-graph.component';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'home-dashboard',
  templateUrl: './home-dashboard.component.html',
  imports: [LineGraph, DoughnutChartComponent, CommonModule, ToFormatBrlPipe, MatIconModule],
})
export class HomeDashboardComponent implements OnInit {
  private readonly summaryService = inject(SummaryService);

  private _bookingsHistory?: BookingHistory;
  private _popularServices?: PopularService[];
  private _revenue?: RevenueHistoryDTO;
  private _general?: GeneralHistoryDTO;
  private _methods?: MethodHistoryDTO;

  get revenue() {
    return this._revenue;
  }

  get popularService() {
    return this._popularServices;
  }

  get general() {
    return this._general?.count;
  }

  get payMethods() {
    return this._methods?.methods;
  }

  get lineChartLabels() {
    return this._bookingsHistory?.bookings.map((b) => b.date);
  }

  get lineChartValues() {
    return this._bookingsHistory?.bookings.map((b) => b.count);
  }

  get totalBookingsInMonth() {
    return this._bookingsHistory?.bookings?.reduce((sum, booking) => sum + booking.count, 0) || 0;
  }

  get doughnutChartKeys() {
    if (!this._methods?.methods) return [];
    return Object.keys(this._methods.methods);
  }

  get doughnutChartColors() {
    if (!this.doughnutChartKeys) return [];
    return this.doughnutChartKeys.map((key) => this.getPaymentMethodHexColor(key));
  }

  get payMethodsArray() {
    if (!this._methods?.methods) return [];
    return Object.entries(this._methods.methods).map(([key, value]) => ({
      key: key,
      count: value.count,
      name: this.formatPaymentMethodName(key),
      colorClass: this.getPaymentMethodColor(key),
    }));
  }

  private getPaymentMethodHexColor(methodKey: string): string {
    switch (methodKey.toUpperCase()) {
      case 'PIX':
        return '#6366f1'; // indigo-500
      case 'CASH':
        return '#10b981'; // emerald-500
      case 'CREDIT_CARD':
        return '#a855f7'; // purple-500
      case 'DEBIT_CARD':
        return '#eab308'; // yellow-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  get revenuePercentageChange(): number {
    if (!this._revenue || this._revenue.revenueOfLastMonth === 0) return 0;
    const { revenue, revenueOfLastMonth } = this._revenue;
    return ((revenue - revenueOfLastMonth) / revenueOfLastMonth) * 100;
  }

  get isRevenueIncrease(): boolean {
    return this.revenuePercentageChange >= 0;
  }

  get doughnutChartLabels() {
    if (!this._methods?.methods) return [];
    return Object.keys(this._methods.methods).map((key) => this.formatPaymentMethodName(key));
  }

  get doughnutChartValues() {
    if (!this._methods?.methods) return [];
    return Object.values(this._methods.methods).map((v) => v.count);
  }

  public ngOnInit(): void {
    this.fetchDashboardData();
  }

  private async fetchDashboardData(): Promise<void> {
    [this._bookingsHistory, this._revenue, this._general, this._methods, this._popularServices] = await Promise.all([
      firstValueFrom(this.summaryService.getBookingHistory()),
      firstValueFrom(this.summaryService.getRevenue()),
      firstValueFrom(this.summaryService.getGeneral()),
      firstValueFrom(this.summaryService.getMethodsHistory()),
      firstValueFrom(this.summaryService.getPopularServices())
    ]);
  }

  private formatPaymentMethodName(methodKey: string): string {
    switch (methodKey.toUpperCase()) {
      case 'PIX':
        return 'Pix';
      case 'CASH':
        return 'Dinheiro';
      case 'CREDIT_CARD':
        return 'Crédito';
      case 'DEBIT_CARD':
        return 'Débito';
      default:
        return methodKey;
    }
  }
  private getPaymentMethodColor(methodKey: string): string {
    switch (methodKey.toUpperCase()) {
      case 'PIX':
        return 'bg-indigo-500';
      case 'CASH':
        return 'bg-emerald-500';
      case 'CREDIT_CARD':
        return 'bg-purple-500';
      case 'DEBIT_CARD':
        return 'bg-yellow-500';
      default:
        return 'bg-stone-500';
    }
  }
}
