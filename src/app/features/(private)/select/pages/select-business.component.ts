import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DecorativeShapesComponent } from '../components/decorative-shapes/decorative-shapes.components';

@Component({
  templateUrl: './select-business.component.html',
	styleUrl: "./select-business.component.css",
	imports: [CommonModule, DecorativeShapesComponent]
})
export class SelectBusinessComponent {}
