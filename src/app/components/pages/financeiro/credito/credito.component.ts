import { Component, OnInit } from '@angular/core';

import { FinanceiroService } from './../../../../shared/services/financeiro.service';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { MatDialog } from '@angular/material';
import { AuthService } from 'src/app/shared/services/auth.service';
@Component({
  selector: 'app-credito',
  templateUrl: './credito.component.html',
  styleUrls: ['./credito.component.scss']
})
export class CreditoComponent implements OnInit {

  public boletoValor;
  public boleto;
  public saldo = null;
  public showSaldo = false;
  public showLoader = true;
  public showLoaderBol = false;
  public barCode;
  public extratos;
  public isMatriz = this.auth.isUserMatriz;
  public currencyOption = { prefix: 'R$ ', thousands: '.', decimal: ',' };

  constructor(
    private financeiroService: FinanceiroService,
    private auth: AuthService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.showLoader = true;

    this.getSaldo();
    this.getExtratos();
  }

  getSaldo() {
    this.financeiroService.getSaldo().subscribe((response: any) => {
      this.showSaldo = true;
      this.saldo = response.data;
    });
  }

  gerarBoleto() {
    if (this.boletoValor > 10000) {
      alert('Valor deve ser de até R$ 10.000,00');
      this.boletoValor = '';
      return;
    }
    this.showLoaderBol = true;
    this.financeiroService.gerarBoleto(this.boletoValor).subscribe((response: any) => {
      if (!response.data) {
        this.showDialog('', 'Por favor, acesse Financeiro -> Documentos e complete todos os dados. Caso já tenha feito isso,' +
          'aguarde até 12h para aprovar e gerar um boleto. Continue pedindo entregas, o saldo negativo será ' +
          'ajustado no primeiro boleto pago.')
      } else {
        this.barCode = response.data.WirecardLinhaDigitavel;
        this.boleto = response.data.WirecardBoletoUrl;
      }
      this.showLoaderBol = false;

    });
  }

  downloadBoleto() {
    window.open(this.boleto);
  }

  getExtratos() {
    this.showLoader = true;
    this.financeiroService.getExtrato().subscribe((response: any) => {
      this.extratos = response.data.filter(extrato => extrato.tipo === 'credito' && !extrato.pedidoId);
      this.showLoader = false;
    });
  }

  showDialog(title, message) {
    this.dialog.open(MottuDialog, {
      width: '400px',
      disableClose: true,
      data: { message: { title: title, body: message } }
    });
  }


}

