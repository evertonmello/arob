
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from './../../../environments/environment';
import { Pedido } from './../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private pedidoAtual: number;
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {
  }

  setPedidoDetalhe(id: number) {
    this.pedidoAtual = id;
  }

  get pedidoDetalhe(): number {
    return this.pedidoAtual;
  }

  checkDoc() {
    return this.http.get(this.baseUrl + 'marketplace/UsuarioStatus');
  }

  addPedido(pedido: Pedido) {
    return this.http.post(this.baseUrl + 'marketplace/pedido', pedido);
  }

  addPedidoRoteirizado(pedidos: Pedido[]) {
    return this.http.post(this.baseUrl + 'marketplace/PedidoRoteirizado', pedidos);
  }

  buscaHist(situacaoUrl: string) {
    return this.http.get(this.baseUrl + 'marketplace/pedido' + situacaoUrl);
  }

  buscaAndamento(situacaoUrl: string, skip: number, take: number) {
    return this.http.get(this.baseUrl + 'marketplace/NovaRotaPedido' + situacaoUrl + '&skip=' + skip + '&take=' + take);
  }

  buscaDetalhePedido(pedido: number) {
    return this.http.get(this.baseUrl + 'marketplace/pedido/' + pedido);
  }

  buscaDetalhePedidoVenda(vendaId: number) {
    const mlToken = localStorage.getItem('mlToken');
    return this.http.get(this.baseUrl + 'mercadolivre/venda?vendaId=' + vendaId + '&access_token=' + mlToken);
  }

  cancelarPedido(numeroPedido: number) {
    return this.http.post(this.baseUrl + 'marketplace/pedido/cancelar/' + numeroPedido, {});
  }

  finalizarPedido(numeroPedido: number) {
    return this.http.get(this.baseUrl + 'marketplace/pedidosituacao/' + numeroPedido + '/30');
  }

  kickarEntregador(numeroPedido: number) {
    return this.http.post(this.baseUrl + 'marketplace/pedido/kick/' + numeroPedido, {});
  }

  incluirEntregador(idEntregador: string, numPedido: number) {
    return this.http.post(this.baseUrl + 'marketplace/pedido/' + numPedido + '/aceitar/' + idEntregador, {});
  }

  incluirEnvio(numPedido: number, envioId: string) {
    return this.http.post(this.baseUrl + 'marketplace/mercadolivre/incluirenvio?pedidoId=' + numPedido + '&envioId=' + envioId, {});
  }

  buscaPedidoRoteirizado(pedidoId: string) {
    return this.http.get(this.baseUrl + 'marketplace/buscarpedidoroteirizado?pedidoId=' + pedidoId);
  }

  iniciaPedido(pedidoId: string) {
    return this.http.post(this.baseUrl + 'marketplace/iniciarpedido?pedidoId=' + pedidoId, {});
  }

  removerenvio(numPedido: number, envioId: string) {
    return this.http.post(this.baseUrl + 'marketplace/mercadolivre/removerenvio?pedidoId=' + numPedido + '&envioId=' + envioId, {});
  }

  calculaValorPedido(rotas: any[]) {
    return this.http.post(this.baseUrl + 'marketplace/PreviaValor', rotas);
  }

}

