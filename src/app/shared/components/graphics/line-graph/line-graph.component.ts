import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'line-graph',
  styleUrl: './line-graph.component.css',
  template: `
    <canvas baseChart [data]="lineChartData" [options]="lineChartOptions" [type]="lineChartType">
    </canvas>
  `,
  imports: [BaseChartDirective],
})
export class LineGraph implements AfterViewInit, OnChanges {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public readonly lineChartType: ChartType = 'line';
  private readonly primaryColor = '#4F46E5';
  private readonly grayColor = '#6B7280';
  private readonly gridColor = '#E5E7EB';

  public ngAfterViewInit(): void {
    this.applyGradient();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // Verifica se os inputs 'data' ou 'labels' mudaram
    if (changes['data'] || changes['labels']) {
      // Atualiza os dados do gráfico com os novos valores recebidos
      this.lineChartData.datasets[0].data = this.data || [];
      this.lineChartData.labels = this.labels || [];

      // Atualiza o gráfico para renderizar as mudanças
      this.chart?.update();
    }
  }

  @Input()
  public labels?: string[];

  @Input()
  public data?: any[];

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Receita',
        fill: true,
        tension: 0.3,
        borderColor: this.primaryColor,
        backgroundColor: 'rgba(0,0,0,0)',
        pointRadius: 0,
        pointHitRadius: 0,
        pointBackgroundColor: this.primaryColor,
        pointBorderColor: this.primaryColor,
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

  private applyGradient(): void {
    // Verificações iniciais para garantir que o gráfico e o contexto existem
    if (!this.chart?.ctx || !this.chart.chart) {
      console.error('Chart ou contexto não encontrado.');
      return;
    }

    // Verificação para o caso de o contexto ser uma string (boa prática)
    if (typeof this.chart.ctx === 'string') {
      console.error('O contexto do gráfico foi retornado como uma string.');
      return;
    }

    const canvas = this.chart.ctx as unknown as CanvasRenderingContext2D;

    const chartArea = this.chart.chart.chartArea;

    if (!chartArea) {
      setTimeout(() => this.applyGradient(), 50);
      return;
    }

    const gradient = canvas.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

    gradient.addColorStop(0, 'rgba(79, 70, 229, 0)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.3)');

    if (this.lineChartData.datasets[0]) {
      this.lineChartData.datasets[0].backgroundColor = gradient;
    }

    this.chart.update();
  }
}
