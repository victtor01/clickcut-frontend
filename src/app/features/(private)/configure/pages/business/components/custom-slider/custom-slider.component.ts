import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  templateUrl: './custom-slider.component.html',
  imports: [CommonModule],
	selector: "custom-slider",
  styleUrls: ['./custom-slider.component.scss'],
})
export class CustomSliderComponent implements AfterViewInit, OnChanges {
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() value: number = 0;

  // --- Saídas (Events) ---
  @Output() valueChange = new EventEmitter<number>(); // Para two-way binding [(value)]
  @Output() input = new EventEmitter<number>(); // Dispara durante o arrasto
  @Output() change = new EventEmitter<number>(); // Dispara ao soltar

  // --- Referências aos Elementos do Template ---
  @ViewChild('track') trackRef!: ElementRef<HTMLDivElement>;

  // --- Propriedades Internas ---
  public fillPercentage: number = 0;
  private isDragging = false;
  private trackRect!: DOMRect;

  ngOnChanges(changes: SimpleChanges): void {
    // Garante que o slider atualize se os inputs mudarem dinamicamente
    if (changes['value'] || changes['min'] || changes['max']) {
      this.updateVisuals();
    }
  }

  ngAfterViewInit(): void {
    // ngAfterViewInit garante que o #track já exista no DOM
    this.trackRect = this.trackRef.nativeElement.getBoundingClientRect();
    this.updateVisuals();
  }

  // --- Gerenciadores de Eventos de Arraste (Drag) ---

  onDragStart(event: PointerEvent | TouchEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.trackRect = this.trackRef.nativeElement.getBoundingClientRect(); // Recalcula em caso de resize

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    this.updateValueFromPosition(clientX);
  }

  @HostListener('window:pointermove', ['$event'])
  onDragMove(event: PointerEvent | TouchEvent): void {
    if (!this.isDragging) return;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    this.updateValueFromPosition(clientX);
  }

  @HostListener('window:pointerup')
  onDragEnd(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.change.emit(this.value); // Dispara o evento 'change' ao final
    }
  }

  // --- Lógica Principal ---

  private updateValueFromPosition(clientX: number): void {
    const position = Math.max(0, Math.min(this.trackRect.width, clientX - this.trackRect.left));
    const percentage = position / this.trackRect.width;

    const rawValue = this.min + percentage * (this.max - this.min);

    // Lógica para "snap" ao step mais próximo
    const numOfSteps = (rawValue - this.min) / this.step;
    const closestStepValue = Math.round(numOfSteps) * this.step + this.min;

    // Garante que o valor final esteja dentro dos limites min/max
    const clampedValue = Math.max(this.min, Math.min(this.max, closestStepValue));

    if (this.value !== clampedValue) {
      this.value = clampedValue;
      this.updateVisuals();

      // Dispara os eventos para o componente pai
      this.input.emit(this.value);
      this.valueChange.emit(this.value); // Essencial para o [(value)] funcionar
    }
  }

  private updateVisuals(): void {
    const range = this.max - this.min;
    if (range === 0) {
      this.fillPercentage = 0;
      return;
    }
    this.fillPercentage = ((this.value - this.min) / range) * 100;
  }
}
