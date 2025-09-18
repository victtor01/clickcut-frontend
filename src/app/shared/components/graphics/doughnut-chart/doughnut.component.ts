import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartData, ChartOptions, Plugin } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-doughnut-chart',
  standalone: true, // Componente standalone para fácil uso
  imports: [BaseChartDirective],
  template: `
    <canvas
      baseChart
      [data]="doughnutChartData"
      [options]="doughnutChartOptions"
      [type]="doughnutChartType"
      [plugins]="doughnutChartPlugins"
    >
    </canvas>
  `,
})
export class DoughnutChartComponent implements OnChanges {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public readonly doughnutChartType = 'doughnut';

  @Input()
  public labels?: string[];

  @Input()
  public data?: any[];

  @Input()
  public colors?: string[];

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [], // Roxo, Verde, Laranja, Azul
        borderWidth: 0,
      },
    ],
  };

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['labels']) {
      this.doughnutChartData.datasets[0].data = this.data || [];
      this.doughnutChartData.labels = this.labels || [];
      this.doughnutChartData.datasets[0].backgroundColor = this.colors;
      this.chart?.update();
    }
  }
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: {
        display: false, // Esconde a legenda padrão
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const sum = context.dataset.data.reduce(
              (a, b) => (a as number) + (b as number),
              0
            ) as number;
            const percentage = ((value / sum) * 100).toFixed(0);
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
  };

  // Plugin customizado para desenhar o texto no centro do gráfico
  public doughnutChartPlugins: Plugin<'doughnut'>[] = [];
}
