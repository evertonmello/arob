import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from './../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MeliService {
  private baseUrl = environment.baseUrl;

  get mercadolivre_expires_token() {
    return localStorage.getItem('meli_expires_token_date');
  }

  get mercadolivre_access_token() {
    return localStorage.getItem('mercadolivre_access_token');
  }

  constructor(private http: HttpClient, private auth: AuthService) {}

  getMeliToken(code: string) {
    this.http
      .post(this.baseUrl + 'mercadolivre/authorization?code=' + code, {})
      .subscribe(
        (result: any) => {
          if (result.sucesso) {
            let mercadolivre_access_token = result.data.access_token;
            let mercadolivre_expires_token = new Date();
            mercadolivre_expires_token.setSeconds(
              mercadolivre_expires_token.getSeconds() + result.data.expires_in
            );

            localStorage.setItem(
              'mercadolivre_access_token',
              mercadolivre_access_token
            );
            localStorage.setItem(
              'meli_expires_token_date',
              JSON.stringify(mercadolivre_expires_token)
            );
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getEnvios() {
    const code = this.auth.meliRefreshToken;
    return this.http.get(
      this.baseUrl + 'mercadolivre/envios?access_token=' + code
    );
  }

  novaRota(enviosId: Array<any>) {
    return this.http.post(
      this.baseUrl +
        'marketplace/mercadolivre/atualizastatusenvio?enviosId=' +
        enviosId.join(',') +
        '&situacao=10',
      {}
    );
  }

  criarPrevia(enviosId: Array<any>) {
    return this.http.post(
      this.baseUrl +
        'marketplace/mercadolivre/previapedido?enviosId=' +
        enviosId.join(','),
      {}
    );
  }

  getMeliContas() {
    return this.http.get(this.baseUrl + 'mercadolivre/contas');
  }

  processarShipment(shipment: any) {
    return this.http.post(
      `${this.baseUrl}mercadolivre/resource/${shipment}`,
      {}
    );
  }

  reprocessarPedidos(usuarioId: any) {
    return this.http.post(
      `${this.baseUrl}mercadolivre/renotificacao/${usuarioId}`,
      {}
    );
  }

  atualizarToken(sellerId: string) {
    return this.http.post(
      `${this.baseUrl}mercadolivre/refreshtoken/${sellerId}`,
      {}
    );
  }
}
