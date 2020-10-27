import { Component, OnInit, Input, Output, OnDestroy, EventEmitter, HostListener } from '@angular/core';
import { PedidoService } from 'src/app/shared/services/pedido.service';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment';

import { Mapa } from './../../../../shared/models/mapa.models';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { MatDialog } from '@angular/material';
import { ConfirmDialogMottu } from 'src/app/shared/dialogs/confirm-dialog-mottu';
import { ConfirmDialogAlterarFrete } from 'src/app/shared/dialogs/dialog-aumenta-frete';

declare let google: any;

@Component({
  selector: 'detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class DetalhesComponent implements OnInit, OnDestroy {

  public numeroPedido: number;
  public pedido;
  public showLoader = true;
  public mapa = new Mapa();
  public count = 1;
  public idEntregador;
  public COUNT_ROUTE = 6;
  public tempoDecorrido;
  public isAdmin = this.auth.isUserAdmin;
  public distancia;
  public showMapa = false;
  public situacao = false;
  @Input() nPedido;
  @Input() ml = false;
  @Output() closeEvt = new EventEmitter();

  constructor(
    private pedidoService: PedidoService,
    private ac: ActivatedRoute,
    private auth: AuthService,
    public dialog: MatDialog,

  ) {
  }
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.close();
    }
  }
  ngOnInit() {
    this.numeroPedido = this.nPedido;

    this.setNumPedido(this.ac.snapshot.params);

    this.mapa.iconeMoto = {
      url: './assets/img/moto.png',
      scaledSize: new google.maps.Size(25, 25),
    };

    this.mapa.iconeCasa = {
      url: './assets/img/icon-house.png',
      scaledSize: new google.maps.Size(25, 35),
    };

    this.mapa.iconeRestaurante = {
      url: './assets/img/icon-restaurant.png',
      scaledSize: new google.maps.Size(50, 40),
    };
  }

  setNumPedido(urlPrams) {

    if (this.numeroPedido) {
      if (this.ml) {
        this.getDetalhePedidoVendas();
      } else {
        this.getDetalhePedido();
      }
    }
  }

  close() {
    this.closeEvt.emit();
  }

  inicializarMapa() {

    const Center = new google.maps.LatLng(this.pedido.vendedorLatitude, this.pedido.vendedorLongitude);

    this.mapa.directionsService = new google.maps.DirectionsService();
    this.mapa.bounds = new google.maps.LatLngBounds();

    this.mapa.directionsDisplay = new google.maps.DirectionsRenderer({
      map: this.mapa.map,
      suppressMarkers: true
    });

    const properties = {
      center: Center,
      zoom: 20,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.mapa.map = new google.maps.Map(document.getElementById('mapaDetalhe'), properties);
    this.mapa.directionsDisplay.setMap(this.mapa.map);
  }

  getDetalhePedido() {
    this.pedidoService.buscaDetalhePedido(this.numeroPedido).subscribe((response: any) => {
      this.showLoader = false;
      this.pedido = response.data[0];

      if (this.pedido.situacao == 0) {
        this.situacao = true;
      }

      this.inicializarMapa();
      this.bindMapa();
    });
  }

  aumentarFrete() {
    var dialogRef = this.dialog.open(ConfirmDialogAlterarFrete, {
      width: '700px',
      disableClose: false,
      data: this.pedido      
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getDetalhePedido();
    });
  }

  getDetalhePedidoVendas() {
    this.pedidoService.buscaDetalhePedidoVenda(this.numeroPedido).subscribe((response: any) => {
      this.showLoader = false;
      this.pedido = response.data[0];
      this.inicializarMapa();
      this.bindMapa();
    });
  }


  route(origemLatitude, origemLongitude, destinoLatitude, destinoLongitude, situacao) {
    const start = new google.maps.LatLng(origemLatitude, origemLongitude);
    const end = new google.maps.LatLng(destinoLatitude, destinoLongitude);
    const request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.mapa.directionsService.route(request, (result, status) => {

      if (status == google.maps.DirectionsStatus.OK) {

        this.mapa.directionsDisplay.setDirections(result);

        // $('#distancia_restante_pedido').html(result.routes[0].legs[0].distance.text);
        let distancia_restante_pedido = result.routes[0].legs[0].distance.text;
        let distancia_pedido;
        let tempo_entrega_pedido;
        let tempo_total_pedido;
        let pedido;

        this.distancia = result.routes[0].legs[0].distance.text;
        this.tempoDecorrido = result.routes[0].legs[0].duration.text;

        if (situacao < 30) {
          tempo_entrega_pedido = result.routes[0].legs[0].duration.text;
          let minutos = parseInt(moment.duration(result.routes[0].legs[0].duration.value, 'seconds').asMinutes().toFixed());
          //tempo_total_pedido = minutos + pedido.minutosDecorridos
        }

        if (situacao == 0 || situacao == 30) {
          distancia_pedido = result.routes[0].legs[0].distance.text;
        }
        this.showMapa = true;
      }
    });
  }


  bindMapa() {

    const origem: any = {};
    const destino: any = {};
    if ([0, 30, 40, 50, 60, 70].includes(this.pedido.situacao)) {
      origem.icone = this.mapa.iconeRestaurante;
      destino.icone = this.mapa.iconeCasa;

      origem.latitude = this.pedido.vendedorLatitude;
      origem.longitude = this.pedido.vendedorLongitude;

      destino.latitude = this.pedido.entregaLatitude;
      destino.longitude = this.pedido.entregaLongitude;
    } else if ([5, 10].includes(this.pedido.situacao)) {
      origem.icone = this.mapa.iconeMoto;
      destino.icone = this.mapa.iconeRestaurante;

      origem.latitude = this.pedido.entregadorLatitude;
      origem.longitude = this.pedido.entregadorLongitude;

      destino.latitude = this.pedido.vendedorLatitude;
      destino.longitude = this.pedido.vendedorLongitude;

    } else if (this.pedido.situacao == 20) {
      origem.icone = this.mapa.iconeMoto;
      destino.icone = this.mapa.iconeCasa;

      origem.latitude = this.pedido.entregadorLatitude;
      origem.longitude = this.pedido.entregadorLongitude;

      destino.latitude = this.pedido.entregaLatitude;
      destino.longitude = this.pedido.entregaLongitude;

    }

    origem.posicao = new google.maps.LatLng(origem.latitude, origem.longitude);
    this.mapa.markerOrigem = new google.maps.Marker({
      position: origem.posicao,
      icon: origem.icone,
      map: this.mapa.map
    });

    destino.posicao = new google.maps.LatLng(destino.latitude, destino.longitude);
    this.mapa.markerDestino = new google.maps.Marker({
      position: destino.posicao,
      icon: destino.icone,
      map: this.mapa.map
    });

    this.mapa.bounds.extend(origem.posicao);
    this.mapa.bounds.extend(destino.posicao);
    this.mapa.map.fitBounds(this.mapa.bounds);

    this.route(origem.latitude, origem.longitude, destino.latitude, destino.longitude, this.pedido.situacao);

    this.count++;

    window.setTimeout(() => {

      if (this.count) {
        this.getDetalhePedido();
      }
    }, 60000);
  }

  cancelar() {

    let pedidoAceito = false;
    let dtCriacaoPedido = new Date(this.pedido.criacaoData);
    let dtCorteCancelamentoPedido = new Date();
    let diferencaEntreDatas = dtCorteCancelamentoPedido.getTime() - dtCriacaoPedido.getTime();
    let resultadoEmMinutos = Math.round(diferencaEntreDatas / 60000);

    if (this.pedido.situacao == 5 || this.pedido.situacao == 10 || this.pedido.situacao == 20) {
      pedidoAceito = true;
    }

    if (resultadoEmMinutos > 5 && pedidoAceito) {
      let dialogRefInforma = this.dialog.open(ConfirmDialogMottu, {
        width: '400px',
        disableClose: true,
        data: { title: 'Cancelar Pedido sem estorno', message: 'Esta Corrida está aceita a mais de 5 minutos por isso não será realizado estorno. Deseja cancelar?' }
      });

      this.executaCancelamento(dialogRefInforma);
    } 
    else {
      let dialogRef = this.dialog.open(ConfirmDialogMottu, {
        width: '400px',
        disableClose: true,
        data: { title: 'Cancelar Pedido', message: 'Deseja mesmo cancelar este pedido?' }
      });

      this.executaCancelamento(dialogRef);  
    }
  }

  executaCancelamento(dialogRef) {
    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.pedidoService.cancelarPedido(this.numeroPedido).subscribe((response: any) => {

          if (response.sucesso) {
            this.showDialog('Sucesso', 'Pedido Cancelado com Sucesso');
            this.showLoader = false;
            this.close();
          } else {
            this.showDialog('Erro', response.mensagem);
            this.showLoader = false;
          }
        });
      }
    });
  }

  finalizar() {
    let dialogRef = this.dialog.open(ConfirmDialogMottu, {
      width: '400px',
      disableClose: true,
      data: { title: 'Finalizar Pedido', message: 'Deseja mesmo finalizar este pedido?' }
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.pedidoService.finalizarPedido(this.numeroPedido).subscribe((response: any) => {
          this.showDialog('Sucesso', 'Pedido Finalizado com Sucesso');
        });
      }
    });

  }

  kickarEntregador() {
    this.pedidoService.kickarEntregador(this.numeroPedido).subscribe((response: any) => {
      this.showDialog('Sucesso', 'Entregador kickado com Sucesso');
    });
  }

  incluir() {
    this.pedidoService.incluirEntregador(this.idEntregador, this.numeroPedido).subscribe((response: any) => {
      this.showDialog('Sucesso', 'Entregador incluido com Sucesso');

    });
  }

  showDialog(title, message) {
    this.dialog.open(MottuDialog, {
      width: '400px',
      disableClose: true,
      data: { message: { title: title, body: message } }
    });
  }

  ngOnDestroy() {
    this.count = null;

  }


}
