import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from './../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FinanceiroService {
    private baseUrl = environment.baseUrl;

    constructor(private http: HttpClient) {
    }

    getBancos() {
        return this.http.get(this.baseUrl + 'marketplace/Bancos');
    }

    getDocsStatus(usuarioId) {
      if (usuarioId) {
        return this.http.get(`${this.baseUrl}marketplace/documentos/?usuarioId=${usuarioId}`);
      } else {
        return this.http.get(this.baseUrl + 'marketplace/documentos');
      }

    }

    saveDadosBancarios(code: string, agencia: string, conta: string) {
        return this.http.post(this.baseUrl + 'marketplace/PostDadosBancarios/' + code + '/' + agencia + '/' + conta, {});
    }

    getExtrato() {
        return this.http.get(this.baseUrl + 'marketplace/vendedor/extrato');
    }

    getSaldo() {
        return this.http.get(this.baseUrl + 'marketplace/saldo');
    }

    gerarBoleto(valor: string) {
        return this.http.get(this.baseUrl + 'marketplace/boleto?valor=' + valor);

    }
}
