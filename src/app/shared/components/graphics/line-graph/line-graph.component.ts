import { Component, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'line-graph',
  templateUrl: './line-graph.component.html',
  styleUrl: './line-graph.component.css',
  imports: [BaseChartDirective],
})
export class LineGraph {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // As cores agora estão definidas diretamente aqui
  private readonly primaryColor = '#4F46E5';
  private readonly primaryColorLight = 'rgba(79, 70, 229, 0.2)';
  private readonly grayColor = '#6B7280';
  private readonly gridColor = '#E5E7EB';
  private readonly tooltipBgColor = '#1F2937';

  public lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55],
        label: 'Receita',
        fill: true,
        tension: 0.4,
        borderColor: this.primaryColor,
        backgroundColor: this.primaryColorLight,
        pointBackgroundColor: this.primaryColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: this.primaryColor,
        pointRadius: 0,
        pointHitRadius: 0,
      },
    ],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 4, hoverRadius: 6 },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: { display: false },
        ticks: { color: this.grayColor },
        border: { display: false },
      },
      y: {
        display: false,
        grid: { color: this.gridColor },
        ticks: {
          color: this.grayColor,
          callback: (value) => `R$ ${value}`,
        },
        border: { display: false },
      },
    },
  };

  public lineChartType: ChartType = 'line';

  constructor() {}
}
