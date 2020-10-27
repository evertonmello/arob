import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'brlCurrency' })
export class CurrencyPipe implements PipeTransform {
  transform(value: any): string {
    if (typeof value != 'string') {
      value = value.toString();
    }
    value = value.replace('R$', '');
    value = value.replace(/,/g, '.');
    return value.substring(0, value.length - 3) + ',' + value.substring(value.length - 2, value.length);
  }
}
