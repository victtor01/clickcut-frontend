import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastState = 'visible' | 'leaving';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  state: ToastState;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private toastId = 0;

  public show(message: string, type: ToastType = 'info', duration: number = 2000): void {
    const newToast: Toast = {
      id: this.toastId++,
      message,
      type,
      state: 'visible',
    };

    this.toasts.update((currentToasts) => [...currentToasts, newToast]);

    setTimeout(() => this.startLeaving(newToast.id), duration);
  }

  public success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  public error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  public startLeaving(id: number): void {
    this.toasts.update((toasts) =>
      toasts.map((toast) => (toast.id === id ? { ...toast, state: 'leaving' } : toast))
    );
  }

  public remove(id: number): void {
    this.toasts.update((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );

    this.startLeaving(id);
  }
}
