import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

// Interface para definir a "forma" dos nossos dados de estilo
interface ShapeStyle {
  size: number;
  rotation: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

@Component({
  selector: 'app-decorative-shapes',
  templateUrl: './decorative-shapes.component.html',
  styleUrls: ['./decorative-shapes.component.css'],
  imports: [CommonModule]
})
export class DecorativeShapesComponent implements OnInit {

  public shapes: ShapeStyle[] = [];
  private numberOfShapes = 15; // Quantos elementos você quer gerar

  ngOnInit(): void {
    this.generateShapes();
  }

  private generateShapes(): void {
    const possibleSizes = [40, 60, 80, 100]; // em pixels (w-10, w-16, w-20, w-24)
    const generatedShapes: ShapeStyle[] = [];

    for (let i = 0; i < this.numberOfShapes; i++) {
      // 1. Escolhe um tamanho aleatório
      const size = possibleSizes[Math.floor(Math.random() * possibleSizes.length)];

      // 2. Gera uma rotação aleatória
      const rotation = Math.floor(Math.random() * 90) - 45; // Rotação entre -45 e 45 graus

      // 3. Monta o objeto de estilo
      const style: ShapeStyle = {
        size: size,
        rotation: rotation,
      };
      
      // 4. Define a posição aleatória (vertical e horizontal)
      if (Math.random() > 0.5) {
        style.top = `${Math.floor(Math.random() * 90)}%`;
      } else {
        style.bottom = `${Math.floor(Math.random() * 90)}%`;
      }

      if (Math.random() > 0.5) {
        style.left = `${Math.floor(Math.random() * 90)}%`;
      } else {
        style.right = `${Math.floor(Math.random() * 90)}%`;
      }

      generatedShapes.push(style);
    }

    this.shapes = generatedShapes;
  }
}