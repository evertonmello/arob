import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'situacao'
})
export class SituacaoPipe implements PipeTransform {

  transform(code: any): any {
    return this.getSituacao(code);
  }
  
  getSituacao(code) {
    let situacao = ''
    switch (code) {
      case 0:
        situacao = 'Criado'
        break;
      case 10:
        situacao = 'Aceito'
        break;
      case 20:
        situacao = 'Retirado'
        break;
      case 30:
        situacao = 'Entregue'
        break;

      case 40:
        situacao = 'Entregue'
        break;
      case 50:
        situacao = 'Cancelado'
        break;

        default:
        situacao = 'CanceladoPago'
        break;
    }
    return situacao;
  }

}
