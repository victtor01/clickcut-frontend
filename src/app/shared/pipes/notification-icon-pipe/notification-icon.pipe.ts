import { Pipe, PipeTransform } from '@angular/core';
import { NotificationCategory } from '@app/core/models/Notification';

@Pipe({
  name: 'notificationIcon',
  standalone: true
})
export class NotificationIconPipe implements PipeTransform {
  transform(category: NotificationCategory): string {
    switch (category) {
      case 'INFO':
        return 'info';
      case 'SUCCESS':
        return 'check_circle';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'PAYMENT_RECEIVED':
        return 'attach_money';
      default:
        return 'notifications'; // fallback
    }
  }
}
