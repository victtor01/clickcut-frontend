import { Pipe, PipeTransform } from '@angular/core';
import { NotificationCategory } from '@app/core/models/Notification';

@Pipe({
  name: 'notificationColor',
  standalone: true,
})
export class NotificationColorPipe implements PipeTransform {
  transform(category: NotificationCategory): string {
    console.log(category)
    switch (category) {
      case 'INFO':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      case 'SUCCESS':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ERROR':
        return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300';
      case 'PAYMENT_RECEIVED':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    }
  }
}
