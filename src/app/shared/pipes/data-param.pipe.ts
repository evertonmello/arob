import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataParam'
})
export class DataParamPipe implements PipeTransform {

  transform(value): any {
    switch (value) {
      case "0":
        return 'Hoje'
      case "20":
        return 'Ontem'
      case "30":
        return 'Esta Passada'
      case "40":
        return 'Semana Passada'
      case "50":
        return 'Este Mês'
      case "60":
          return 'Mês Passado'
      
      default:
        return 'Período Todo'
    }
  }

}

