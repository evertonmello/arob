import { Component, OnInit, ViewChild, ApplicationRef, HostListener } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import * as moment from 'moment';


import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { PedidoService } from 'src/app/shared/services/pedido.service';

@Component({
  selector: 'app-recibos',
  templateUrl: './recibos.component.html',
  styleUrls: ['./recibos.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class RecibosComponent implements OnInit {

  public selected: { startDate: moment.Moment, endDate: moment.Moment };
  public locale = {
    applyLabel: 'Confirmar',
    daysOfWeek: moment.weekdaysMin(),
    monthNames: moment.monthsShort(),
  }
  public showElements = true;
  public isLinear = false;
  public showLoader = true;
  public printAll = false;
  public showDetail = false;
  public periodoSelected = '0';
  public situacaoSelected = '';
  public pedidoSelected;
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public displayedColumns = ['numero', 'data', 'valorCorrida', 'documento', 'entregadorNome', 'endereco', 'estorno', 'entregue', 'detalhe'];
  public periodos = [
    { value: '0', label: 'Hoje' },
    { value: '20', label: 'Ontem' },
    { value: '30', label: 'Esta semana' },
    { value: '40', label: 'Semana passada' },
    { value: '50', label: 'Este mês' },
    { value: '60', label: 'Mês passado' },
    { value: '100', label: 'Todo o período' }
  ];
  public recibos = new MatTableDataSource<any>();;

  @HostListener('window:afterprint')
  onafterprint() {
    this.backToTable()
  }
  constructor(private _formBuilder: FormBuilder, private app: ApplicationRef, private pedidoService: PedidoService) { }

  ngOnInit() {

    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.buscaPorPeriodo();
  }

  buscaRecibos() {
    if (this.selected.startDate && this.selected.endDate) {
      let startDate = this.selected.startDate.format('MM-DD-YYYY');
      let endDate = this.selected.endDate.format('MM-DD-YYYY');
      this.buscaRecibosData(startDate, endDate);
    }
  }

  exportarTodosPdf() {
    this.printAll = true;
    this.showDetail = true;
    setTimeout(() => {
      window.print();
    }, 50);
  }

  print() {
    window.print();
  }

  download() {
    var doc = new jsPDF();
    html2canvas(document.getElementById("reciboDownload")).then(canvas => {

      var pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);

      var imgData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 600, 500);
      pdf.save('recibo.pdf');

    });
  }

  buscaRecibosData(startDate: string, endDate: string) {
    this.showLoader = true;

    let situacaoURL;
    situacaoURL = '?situacao[0]=0&situacao[1]=10&situacao[2]=20&situacao[3]=30&situacao[4]=50&situacao' +
      '[5]=70&situacao[6]=40&periodo=100&startDate=' + startDate + '&endDate=' + endDate;

    this.pedidoService.buscaHist(situacaoURL).subscribe((pedidos: any) => {
      this.recibos.data = pedidos.data;
      this.showLoader = false;
    })
  }


  buscaPorPeriodo() {
    this.showLoader = true;

    let situacaoURL;
    situacaoURL = '?situacao[0]=0&situacao[1]=10&situacao[2]=20&situacao[3]=30&situacao[4]=50&situacao[5]=70&situacao[6]=40&periodo=' + this.periodoSelected;

    this.pedidoService.buscaHist(situacaoURL).subscribe((pedidos: any) => {
      this.recibos.data = pedidos.data;
      this.showLoader = false;
    })
  }
  openItem(element) {
    this.printAll = false;
    this.showDetail = true;
    this.showLoader = true;
    this.pedidoService.buscaDetalhePedido(element.id).subscribe((response: any) => {
      this.pedidoSelected = response.data[0]
      this.showLoader = false;
    })
  }

  downloadFile() {
    let exportContent = [];

    this.recibos.data.forEach((item) => {
      exportContent.push({
        id: item.id, nome: item.nome, numero: item.numero, bairro: item.bairro, cep: item.bairro, estado: item.estado, cidade: item.cidade, codigoExterno: item.codigoExterno, complemento: item.complemento,
        dataCriacao: item.criacaoData, entregaDistanciaKm: item.entregaDistanciaKm, entregadorDoc: item.entregadorCpf, entregadorDistancia: item.entregadorDistancia,
        entregadorId: item.entregadorId, entregadorNome: item.entregadorNome, entregadorTelefone: item.entregadorTelefone, origem: item.origem, precificacao: item.precificacaoTipo,
        rua: item.rua, situacao: item.situacaoNome, telefone: item.telefone, temEstorno: item.temEstorno, valorCorrida: item.valorCorrida, vendedorBairro: item.vendedorBairro,
        vendedorCep: item.vendedorCep, vendedorCidade: item.vendedorCidade, vendedorComplemento: item.vendedorComplemento, vendedorDocumento: item.vendedorCpf,
        vendedorEstado: item.vendedorEstado, vendedorId: item.vendedorId, vendedorNome: item.vendedorNome, vendedorNumero: item.vendedorNumero, vendedorRua: item.vendedorRua,
        vendedorTelefone: item.vendedorTelefone
      })
    })


    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportContent);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'ScoreSheet.xlsx');
  }

  backToTable() {
    this.showDetail = false;
    this.printAll = false;
  }

}
