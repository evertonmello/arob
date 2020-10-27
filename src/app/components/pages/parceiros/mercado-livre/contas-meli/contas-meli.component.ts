import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
moment.locale('pt-br');

import { environment } from '../../../../../../environments/environment';
import { MeliService } from 'src/app/shared/services/meli.service';

@Component({
  selector: 'app-contas-meli',
  templateUrl: './contas-meli.component.html',
  styleUrls: ['./contas-meli.component.scss']
})
export class ContasMeliComponent implements OnInit {

  public showLoader = true;
  public contas;
  constructor(private meliService: MeliService) { }

  ngOnInit() {
    this.getContas();
  }

  addConta() {
    let meliUrl = 'http://auth.mercadolivre.com.br/authorization';
    meliUrl += '?response_type=code';
    meliUrl += `&client_id=${environment.meliApp}`;
    meliUrl += `&redirect_uri=${environment.meliUrlRedirect}`;
    this.setMomentToken();
    window.location.assign(meliUrl);

  }

  goToMercadoLivre() {
    window.open('https://www.mercadolivre.com.br/');
  }

  setMomentToken() {
    localStorage.setItem('momentToken', localStorage.getItem('currentUser'));
  }

  getContas() {
    this.meliService.getMeliContas().subscribe((response: any) => {
      this.contas = response.data;
      this.showLoader = false;
    });
  }

  formatarData(data) {
    return moment.utc(data).format('L') + ' ' + moment.utc(data).format('LT');
  }

  tokenExpirado(data) {
    return moment.duration(moment.utc(new Date()).diff(moment.utc(new Date(data)))).asMinutes() > 0;
  }

  AtualizarToken(token) {
    alert(token);
    this.meliService.atualizarToken(token).subscribe((response: any) => {
      if (response) {
        alert('Atualizado com sucesso!');
        this.ngOnInit();
      } else {
        alert('Erro, tente re-adionar sua integração no borabora, basta deslogar do seu mercado livre e clicar em adicionar conta no botão abaixo.');
      }
    });

  }

}
