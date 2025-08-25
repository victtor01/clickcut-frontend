import { Pipe, PipeTransform } from '@angular/core';
import { formatToBRL } from '@app/shared/utils/format-to-brl';

@Pipe({
  name: 'toFormatBrl',
})
export class ToFormatBrlPipe implements PipeTransform {
  transform(value?: number, ...args: unknown[]): unknown {
    return formatToBRL(value || 0);
  }
}
