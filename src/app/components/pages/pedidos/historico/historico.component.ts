import { Component, OnInit } from '@angular/core';

import { PedidoService } from './../../../../shared/services/pedido.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss']
})
export class HistoricoComponent implements OnInit {


  public pedidos;
  public periodoSelected = '0';
  public situacaoSelected = '';
  public showLoader = true;
  public pedidoSeleced;
  public periodos = [
    { value: "0", label: 'Hoje' },
    { value: "20", label: 'Ontem' },
    { value: "30", label: 'Esta semana' },
    { value: "40", label: 'Semana passada' },
    { value: "50", label: 'Este mês' },
    { value: "60", label: 'Mês passado' },
    { value: "100", label: 'Todo o período' }
  ];

  public situacoes = [
    { value: "", label: 'Todos' },
    { value: "0", label: 'Não Aceitos' },
    { value: "10", label: 'Aceitos' },
    { value: "20", label: 'Retirados' },
    { value: "30", label: 'Entregues' },
    { value: "50e70", label: 'Cancelados' },
    { value: "50", label: 'Cancelados com estorno' },
    { value: "70", label: 'Cancelados sem estorno' }
  ]


  public displayedColumns: string[] = ['estabelecimento', 'horario', 'nBorabora', 'nEstabelecimento', 'origemPedido', 'situacao', 'detalhes'];
  constructor(
    private pedidoService: PedidoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.buscaPorPeriodo()
  }


  buscaPorPeriodo() {
    this.showLoader = true;

    let situacaoURL;

    if (this.periodoSelected == '0' && this.situacaoSelected == '') {
      situacaoURL = '?situacao[0]=0&situacao[1]=10&situacao[2]=20&situacao[3]=30&situacao[4]=50&situacao[5]=70'
    } else {
      if (this.situacaoSelected == '') {
        situacaoURL = '?situacao[0]=0&situacao[1]=10&situacao[2]=20&situacao[3]=30&situacao[4]=50&situacao[5]=70&ativo=false&periodo=' + this.periodoSelected;
      } else {
        situacaoURL = '?ativo=false&periodo=' + this.periodoSelected + '&situacao=' + this.situacaoSelected;

      }
    }

    if (this.situacaoSelected == '50e70') {
      situacaoURL = '?&situacao[0]=50&situacao[1]=70&ativo=false&periodo=' + this.periodoSelected;
    }

    this.pedidoService.buscaHist(situacaoURL).subscribe((pedidos: any) => {
      this.pedidos = pedidos.data;
      this.showLoader = false;

    })
  }

  detalhePedido(pedido) {
    if (pedido.origem == 'MERCADOLIVRE') {
      this.showLoader = true;
      this.router.navigate(['pedido-detalhe/' + pedido.id]);
    } else {
      this.pedidoService.setPedidoDetalhe(pedido.id);
      this.pedidoSeleced = null
      setTimeout(() => {
        this.pedidoService.setPedidoDetalhe(pedido.id)
        this.pedidoSeleced = pedido.id;
      }, 50);
    }
  }

}
