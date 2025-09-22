import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { AppointmentsProps } from '../../public-business.component';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule, ToFormatBrlPipe],
  templateUrl: './bookings-summary.component.html',
})
export class BookingSummaryComponent implements OnChanges {
  @Input()
  public data?: AppointmentsProps | null = null;

  @Input()
  public label?: string = 'Próxima';

  @Input()
  public isValid: boolean = true;

  @Output()
  public nextStep = new EventEmitter<void>();

  public next() {
    if (this.nextStep) {
      this.nextStep.emit();
    }
  }

  public totalPrice = 0;
  public totalDuration = 0;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.calculateTotals();
    }
  }

  private calculateTotals(): void {
    if (!this.data || !this.data.services) {
      this.totalPrice = 0;
      this.totalDuration = 0;
      return;
    }

    this.totalPrice = this.data.services.reduce((sum, srv) => sum + srv.price, 0);
    this.totalDuration = this.data.services.reduce((sum, srv) => sum + srv.durationInMinutes, 0);
  }

  // NOVA PROPRIEDADE para controlar o modal
  public isSummaryOpen = false;

  // ... ngOnChanges e outros métodos

  // NOVAS FUNÇÕES para abrir e fechar
  public openSummary(): void {
    this.isSummaryOpen = true;
  }

  public closeSummary(): void {
    this.isSummaryOpen = false;
  }
}
