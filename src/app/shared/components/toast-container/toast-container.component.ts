import { Component, Signal } from '@angular/core';
import { Toast, ToastService } from '@app/core/services/toast.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
  standalone: true,
  imports: [ToastComponent],
})
export class ToastContainerComponent {
  public toasts: Signal<Toast[]>;
  constructor(public readonly toastService: ToastService) {
    this.toasts = toastService.toasts;
  }
}
