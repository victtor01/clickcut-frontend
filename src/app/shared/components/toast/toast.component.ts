import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Toast } from '@app/core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastTrigger', [
      state('visible', style({ transform: 'scale(1) translateY(0)', opacity: 1 })),
      state('leaving', style({ transform: 'scale(0.5) translateY(-3rem)', opacity: 0 })),

      transition('void => visible', [
        style({ transform: 'scale(0) translateY(-3rem)', opacity: 0 }),
        animate('200ms ease-out'),
      ]),

      transition('visible => leaving', [animate('200ms ease-in')]),
    ]),
  ],
})
export class ToastComponent {
  @Input() toast!: Toast;
  // Este evento avisará o container para remover o toast do array
  @Output() destroy = new EventEmitter<void>();

  // NOVO: Método para ser chamado quando a animação terminar
  onAnimationDone(event: any) {
    // Se a transição para 'leaving' terminou
    if (event.toState === 'leaving') {
      this.destroy.emit();
    }
  }
}
