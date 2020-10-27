import { Component, OnInit, ViewChild, HostListener, ElementRef, QueryList } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';
moment.locale('pt-br');

import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PageEnum } from '../../../../shared/enums/page.enum';

@Component({
  selector: 'app-usuario-listagem',
  templateUrl: './usuario-listagem.component.html',
  styleUrls: ['./usuario-listagem.component.scss']
})
export class UsuarioListagemComponent implements OnInit {

  public periodos = [
    { value: '0', label: 'Hoje' },
    { value: '20', label: 'Ontem' },
    { value: '30', label: 'Esta semana' },
    { value: '40', label: 'Semana passada' },
    { value: '50', label: 'Este mês' },
    { value: '60', label: 'Mês passado' },
    { value: '100', label: 'Todo o período' }
  ];

  public ramos = [
    { value: '', label: 'Todos' },
    { value: '1', label: 'Comida' },
    { value: '2', label: 'Varejo' }
  ];

  public pages;
  public paginaAtual = 0;
  public skip = 0;
  public ramoSelected = '';
  public cpfInputed = '';
  public nomeInputed = '';
  public periodoSelected = '100';
  public situacaoSelected = '';
  public showLoader = true;
  public usuarios = [];
  public filialSelected = '0';
  public scollIndex = 1;
  public values;
  public pagaRangeA;
  public pagaRangeB;
  public lojas;
  public usuarioSeleced;
  public userSelected;
  public updateJob;
  public totalListados;
  public emAndamento = 0;
  public isAdmin = this.auth.isUserAdmin;
  public paginacaoType = this.isAdmin ? PageEnum.PAGE_ADM : PageEnum.PAGE_LOJISTA;
  public take = this.paginacaoType;
  public isMatriz = this.auth.isUserMatriz;
  public currentUser = this.auth.userLogged;
  public displayedColumns = ['usuarioId', 'criacaoData', 'ramo', 'nome', 'cpf', 'qtdEntregasDia', 'email', 'telefone'];

  constructor(
    private userService: UserService,
    private router: Router,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    if (!this.isAdmin) {
      alert('Sem acesso!')
      this.router.navigate(['pedidos-andamento']);
    }

    this.buscarUsuarios();
    this.showLoader = false;
  }

  buscaFiltrada() {
    this.showLoader = true;
    this.totalListados = 0;
    this.paginaAtual = 0;
    this.skip = 0;
    this.usuarios = [];
    this.setPageRange();

    this.buscarUsuarios();
  }

  buscarUsuarios() {
    const filtros: any = {};

    if (this.cpfInputed.length == 11 || this.cpfInputed.length == 14) {
      filtros.cpf = this.cpfInputed;
    }

    filtros.nome = this.nomeInputed;
    filtros.periodo = this.periodoSelected;
    filtros.ramo = this.ramoSelected;
    filtros.skip = this.skip;
    filtros.take = this.take;

    this.userService.getUsuariosComFiltros(filtros).subscribe((result: any) => {
      this.usuarios = result.data.usuarios;

      this.totalListados = result.data.countTotal;
      this.emAndamento = result.data.countEmAndamento;

      this.pages = Array.from(Array((Math.round(result.data.countTotal / this.paginacaoType) + 1)).keys());

      this.showLoader = false;
    });
  }

  formatarData(data) {
    return moment.utc(data).local().format('L');
  }

  formatarRamo(id) {
    return id == 1 ? 'Comida' : 'Ecommerce';
  }

  formatarDoc(documento) {
    if (documento && documento.length == 14) {
      return this.mascaraCnpj(documento);
    }

    if (documento && documento.length == 11) {
      return this.mascaraCpf(documento);
    }
  }

  mascaraCpf(valor) {
    return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g,"\$1.\$2.\$3\-\$4");
  }

  mascaraCnpj(valor) {
    return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,"\$1.\$2.\$3\/\$4\-\$5");
  }

  initUpdateJob() {
    this.updateJob = setInterval(() => {
      this.buscarUsuarios();
    }, 60000);
  }

  ngOnDestroy() {
    clearInterval(this.updateJob);
  }

  irParaPagina(pagina) {
    this.showLoader = true;
    this.skip = pagina == 0 ? 0 : pagina * this.paginacaoType;
    this.paginaAtual = pagina;

    this.setPageRange();
    this.buscarUsuarios();
  }

  setPageRange() {
    this.pagaRangeA = this.paginaAtual <= 2 ? 0 : this.paginaAtual - 3;
    this.pagaRangeB = this.paginaAtual + 3;
  }

}

