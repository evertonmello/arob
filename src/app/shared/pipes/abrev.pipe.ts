import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'abreviacao' })
export class AbrevPipe implements PipeTransform {
    transform(value: any): string {
        if (!value) {
            return ''
        }
        if (typeof value != 'string') {
            value = value.toString();
        }

        return value.substring(0, 10) + '...';
    }
}
