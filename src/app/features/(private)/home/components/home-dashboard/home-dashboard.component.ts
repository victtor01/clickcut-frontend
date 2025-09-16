import { Component } from '@angular/core';
import { LineGraph } from '@app/shared/components/graphics/line-graph/line-graph.component';

@Component({
  templateUrl: './home-dashboard.component.html',
  selector: 'home-dashboard',
  imports: [LineGraph],
})
export class HomeDashboardComponent {}
