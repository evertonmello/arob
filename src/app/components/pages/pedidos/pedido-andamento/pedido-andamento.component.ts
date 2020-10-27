import { Component, OnInit, ViewChild, HostListener, ElementRef, QueryList } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';
moment.locale('pt-br');

import { UserService } from '../../../../shared/services/user.service';
import { PedidoService } from './../../../../shared/services/pedido.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LojaService } from 'src/app/shared/services/loja.service';
import { PageEnum } from './../../../../shared/enums/page.enum';

@Component({
  selector: 'app-pedido-andamento',
  templateUrl: './pedido-andamento.component.html',
  styleUrls: ['./pedido-andamento.component.scss']
})
export class PedidoAndamentoComponent implements OnInit {

  public estabelecimentos = [
    { value: '', label: 'Todos' },
    { value: '1', label: 'Comida' },
    { value: '2', label: 'Varejo' }
  ];

  public periodos = [
    { value: '0', label: 'Hoje' },
    { value: '20', label: 'Ontem' },
    { value: '30', label: 'Esta semana' },
    { value: '40', label: 'Semana passada' },
    { value: '50', label: 'Este mês' },
    { value: '60', label: 'Mês passado' },
    { value: '100', label: 'Todo o período' }
  ];

  public situacoes = [
    { value: '', label: 'Todos' },
    { value: '0', label: 'Criados' },
    { value: '10', label: 'Aceitos' },
    { value: '20', label: 'Retirados' },
    { value: '30', label: 'Entregues' },
    { value: '80', label: 'Prévia Roterizado' }
  ];
  public pages;
  public usuarios;
  public paginaAtual = 0;
  public skip = 0;
  public estabelecimentoSelected;
  public periodoSelected = '0';
  public situacaoSelected = '';
  public showLoader = true;
  public pedidos = [];
  public filialSelected = '0';
  public scollIndex = 1;
  public values;
  public pagaRangeA;
  public pagaRangeB;
  public lojas;
  public pedidoSeleced;
  public userSelected;
  public updateJob;
  public totalPedidos;
  public emAndamento = 0;
  public isAdmin = this.auth.isUserAdmin;
  public paginacaoType = this.isAdmin ? PageEnum.PAGE_ADM : PageEnum.PAGE_LOJISTA;
  public take = this.paginacaoType;
  public isMatriz = this.auth.isUserMatriz;
  public currentUser = this.auth.userLogged;
  public displayedColumns = this.isAdmin ? ['origem', 'idPedido', 'entregador', 'estabelecimento',
    'tempoDecorrido', 'pedidoAceito', 'pedidoRetirado',
    'pedidoEntregue', 'detalhes']
    : ['idPedido', 'nBorabora', 'estabelecimento', 'tempoDecorrido',
      'pedidoAceito', 'pedidoRetirado', 'pedidoEntregue', 'detalhes'];

  constructor(
    private userService: UserService,
    private pedidoService: PedidoService,
    private router: Router,
    private auth: AuthService,
    private lojasService: LojaService

  ) { }

  ngOnInit() {
    this.getUsuarios();
    this.buscarPedidos();
    this.getUnidades();
    if (this.auth.isUserAdmin) {
      this.initUpdateJob();
    }
  }

  getUsuarios() {
    this.userService.getUsers().subscribe((usuarios) => {
      this.usuarios = usuarios;
      this.values = usuarios;

    });
  }

  public _filter(value) {
    if (value == '') {
      this.values = this.usuarios;
      this.userSelected = null;
    } else {
      const filterValue = value.toLowerCase();
      this.values = this.usuarios.filter(option => {
        if (option.Nome) {
          return option.Nome.toLowerCase().includes(filterValue) == true || option.Id.toString().toLowerCase().includes(filterValue) == true;
        }
      });
    }
  }

  manageScroll() {
    this.scollIndex++;
  }

  getSituacao(situacao, pedido_status) {
    let pedido_aceito = false, pedido_retirado = false, pedido_entregue = false;

    switch (situacao) {
      case 10:
        pedido_aceito = true;
        break;

      case 20:
        pedido_aceito = true;
        pedido_retirado = true;
        break;

      case 30:
        pedido_aceito = true;
        pedido_retirado = true;
        pedido_entregue = true;
        break;

      case 40:
        pedido_aceito = true;
        pedido_retirado = true;
        pedido_entregue = true;
        break;
    }

    switch (pedido_status) {
      case 'pedido_aceito':
        return pedido_aceito;
      case 'pedido_retirado':
        return pedido_retirado;
      default:
        return pedido_entregue;
    }
  }

  buscaFiltrada() {
    this.showLoader = true;
    this.totalPedidos = 0;
    this.emAndamento = 0;
    this.paginaAtual = 0;
    this.skip = 0;
    this.pedidos = [];
    this.setPageRange();

    this.buscarPedidos();
  }

  getUnidades() {
    this.lojasService.getLojas().subscribe((response: any) => {
      this.lojas = response.data;
    });
  }

  buscarPedidos() {
    let situacaoURL;
    let ramoUrl = '';

    if (this.estabelecimentoSelected) {
      ramoUrl = '&marketplaceRamoId=' + this.estabelecimentoSelected;
    }
    if (this.userSelected) {
      ramoUrl = '&usuarioId=' + this.userSelected + ramoUrl;
    }

    if (this.periodoSelected == '0' && this.situacaoSelected == '' && !this.estabelecimentoSelected) {
      situacaoURL = '?situacao[0]=0&situacao[1]=10&situacao[2]=20&situacao[3]=30&situacao[4]=40&ativo=true&periodo=0';

    } else {
      if (this.situacaoSelected == '') {
        situacaoURL = '?situacao[0]=0&situacao[1]=10&situacao[2]=20&situacao[3]=30&situacao[4]=40&ativo=true' + ramoUrl + '&periodo=' + this.periodoSelected;
      } else {
        situacaoURL = '?ativo=true' + ramoUrl + '&periodo=' + this.periodoSelected + '&situacao=' + this.situacaoSelected;
      }
    }

    if (this.userSelected && this.periodoSelected == '0' && this.situacaoSelected == '' && !this.estabelecimentoSelected) {
      situacaoURL = '?situacao[0]=0&situacao[1]=10&situacao[2]=20&situacao[3]=30&situacao[4]=40&ativo=true&usuarioId=' + this.userSelected + '&periodo=100';
    }

    if (this.situacaoSelected == '50e70') {
      situacaoURL = '?&situacao[0]=50&situacao[1]=70&ativo=true' + ramoUrl + '&periodo=' + this.periodoSelected;
    }

    if (this.isMatriz) {
      situacaoURL = situacaoURL + '&unidadeId=' + this.filialSelected;
    }


    this.pedidoService.buscaAndamento(situacaoURL, this.skip, this.take).subscribe((pedidos: any) => {
      this.pedidos = pedidos.data.pedidos;

      this.totalPedidos = pedidos.data.countTotal;
      this.emAndamento = pedidos.data.countEmAndamento;

      this.pages = Array.from(Array((Math.round(pedidos.data.countTotal / this.paginacaoType) + 1)).keys());

      this.setTempo();
      this.showLoader = false;
    });


  }

  initUpdateJob() {
    this.updateJob = setInterval(() => {
      this.buscarPedidos();
    }, 60000);
  }

  closeDetalhes() {
    this.pedidoSeleced = null;
    this.buscarPedidos();
  }


  setTempo() {
    if (this.pedidos) {
      this.pedidos.forEach(element => {
        if (new Date(element.criacaoData).getUTCDate()) {
          this.setPeriodoDecorrido(element);
        }
      });
    }
  }

  setPeriodoDecorrido(element) {
    let id_pedido;
    id_pedido = element.id;
    let pedido_aceito = false;
    let pedido_retirado = false;
    let pedido_entregue = false;

    element.eventos.forEach((item) => {

      switch (item.situacao) {

        case 10:
          element.datasCorridas[0] = item.criacaoData;
          break;

        case 20:
          element.datasCorridas[1] = item.criacaoData;
          break;

        case 30:
          element.datasCorridas[2] = item.criacaoData;
          break;
      }
    });

    let dataAtualOuEntrega = moment.utc();
    switch (element.situacao) {
      case 10:
        pedido_aceito = true;
        break;

      case 20:
        pedido_aceito = true;
        pedido_retirado = true;
        break;

      case 30:
        pedido_aceito = true;
        pedido_retirado = true;
        pedido_entregue = true;

        const eventoEntrega = element.eventos.filter(function (el) { return el.situacao == 30; });
        if (eventoEntrega.length > 0) {
          dataAtualOuEntrega = moment.utc(eventoEntrega[0].criacaoData);
        }
        break;

      case 40:
        pedido_aceito = true;
        pedido_retirado = true;
        pedido_entregue = true;
        break;
    }


    const dataPedidoMoment = moment.utc(element.criacaoData);

    let duration = moment.duration(dataAtualOuEntrega.diff(dataPedidoMoment));

    // confere e ajusta caso a data de criacao esteja com fuso horario incorreto
    if (element.eventos[0] && (new Date(element.eventos[0].criacaoData).getTime() - new Date(element.criacaoData).getTime()) < 0) {
      element.criacaoData = new Date(element.criacaoData).setHours(new Date(element.criacaoData).getHours() - 3);

      if (element.eventos[2]) {
        duration = moment.duration(moment.utc(new Date(element.eventos[2].criacaoData)).diff(moment.utc(new Date(element.criacaoData))));
      } else {
        duration = moment.duration(moment.utc(new Date()).diff(moment.utc(new Date(element.criacaoData))));
      }
    }
    element.minutosDecorridos = duration.asMinutes();
    element.tempoDecorridoFormatado = this.timeConvert(element.minutosDecorridos.toFixed(0));

    if (element.situacao == 10) {
        const minsColetaAtrasada = moment.duration(moment.utc(new Date()).diff(moment.utc(new Date(element.datasCorridas[0]))));
        element.coletaAtrasada = minsColetaAtrasada.asMinutes() > 60;
    }
  }

  public timeConvert(time) {
    let result = '';
    if (time > 60) {
      result = Math.floor(time / 60) > 1 ? Math.floor(time / 60).toString() + ' horas e ' : Math.floor(time / 60).toString() + ' hora e ';

      result = result + time % 60 + ' min';
    } else {
      result = time + ' min';
    }

    return result;
  }

  detalhePedido(pedido) {
    if (pedido.origem == 'MERCADOLIVRE' || pedido.origem == 'borabora') {
      this.router.navigate(['pedido-detalhe/' + pedido.id]);
    } else {
      this.pedidoSeleced = null;
      setTimeout(() => {
        this.pedidoService.setPedidoDetalhe(pedido.id);
        this.pedidoSeleced = pedido.id;
      }, 50);
    }
  }

  ngOnDestroy() {
    clearInterval(this.updateJob);
  }

  irParaPagina(pagina) {
    this.showLoader = true;
    this.skip = pagina == 0 ? 0 : pagina * this.paginacaoType;
    this.paginaAtual = pagina;

    this.setPageRange();
    this.buscarPedidos();
  }

  setPageRange() {
    this.pagaRangeA = this.paginaAtual <= 2 ? 0 : this.paginaAtual - 3;
    this.pagaRangeB = this.paginaAtual + 3;
  }

}

