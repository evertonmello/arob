import { Component, OnInit, ApplicationRef } from '@angular/core';

import { Mapa } from './../../../../shared/models/mapa.models';
import { PedidoService } from './../../../../shared/services/pedido.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ConfirmDialogMottu } from 'src/app/shared/dialogs/confirm-dialog-mottu';

import * as moment from 'moment';

declare var map;
declare let google: any;

@Component({
  selector: 'app-roteirizado-detalhe',
  templateUrl: './roteirizado-detalhe.component.html',
  styleUrls: ['./roteirizado-detalhe.component.scss'],
})
export class RoteirizadoDetalheComponent implements OnInit {
  public directionsService;
  public directionsDisplay;
  public bounds;
  public idEntregador;
  public distancia;
  public tempoDecorrido;
  public markerOrigem;
  public pedidoId;
  public markerDestino;
  public mapa = new Mapa();
  public pedido;
  public isAdmin = this.auth.isUserAdmin;
  public count = 1;
  public entregaId;
  public locations = [];
  public pedidoIniciado = false;
  public showLoader = true;
  public pedidoSituacao = 0;

  public ENTREGA_SITUACAO = {
    0: 'Pendente',
    10: 'Em rota de coleta',
    20: 'Em rota de entrega',
    30: 'Entregue',
    50: 'Não Entregue',
  };

  constructor(
    private router: Router,
    private pedidoService: PedidoService,
    private ac: ActivatedRoute,
    public dialog: MatDialog,
    private app: ApplicationRef,
    private auth: AuthService
  ) {
    this.pedidoId = this.ac.snapshot.params.id;
  }

  ngOnInit() {
    this.carregaPedido();
  }

  carregaPedido() {
    this.showLoader = true;

    this.pedidoService
      .buscaPedidoRoteirizado(this.pedidoId)
      .subscribe((response: any) => {
        if (response.data) {
          this.pedido = response.data;
          this.atualizaSituacaoEntrega(this.pedido.situacao);
          this.locations = [];
          this.setLocations(this.pedido);
          this.bindMapa();
        } else {
          this.showDialog('Erro', response.mensagem);
          this.showLoader = false;
        }
      });
  }

  atualizaSituacaoEntrega(situacao) {

    switch (situacao) {

      case 0:
        this.pedidoSituacao = 0;
        break;

      case 5:
      case 10:
        this.pedidoSituacao = 10;
        break;

      case 20:
        this.pedidoSituacao = 20;
        break;

      case 30:
      case 40:
        this.pedidoSituacao = 30;
        break;

      default:
        this.pedidoSituacao = 50;
        break;
    }
  }

  inicializarMapa() {
    const Center = new google.maps.LatLng(
      this.pedido.entregaLatitude,
      this.pedido.entregaLongitude
    );
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.bounds = new google.maps.LatLngBounds();

    this.directionsDisplay = new google.maps.DirectionsRenderer({
      map: this.mapa.map,
      suppressMarkers: true,
    });

    this.directionsDisplay = new google.maps.DirectionsRenderer({
      map: this.mapa.map,
      suppressMarkers: true,
    });

    const properties = {
      center: Center,
      zoom: 20,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.mapa.map = new google.maps.Map(
      document.getElementById('mapa'),
      properties
    );
    this.app.tick();

    this.directionsDisplay.setMap(this.mapa.map);
    this.traceRoute();
  }

  setLocations(data) {
    this.mapa.iconeMoto = {
      url: './assets/img/moto.png',
      scaledSize: new google.maps.Size(25, 25),
    };

    this.mapa.iconeCasa = {
      url: './assets/img/icon-house.png',
      scaledSize: new google.maps.Size(25, 35),
    };

    // this.mapa.iconeRestaurante = {
    //   url: './assets/img/icon-restaurant.png',
    //   scaledSize: new google.maps.Size(50, 40),
    // };

    this.mapa.iconeMoto = {
      url: 'assets/img/moto.png',
      scaledSize: new google.maps.Size(25, 25),
      labelOrigin: new google.maps.Point(10, -10),
    };

    this.mapa.iconeCasa = {
      url: 'assets/img/icon-house.png',
      scaledSize: new google.maps.Size(25, 35),
      labelOrigin: new google.maps.Point(10, -10),
    };

    let scl = this.pedido.origem === 'MERCADOLIVRE' ? new google.maps.Size(50, 40) : new google.maps.Size(20, 20);
    this.mapa.iconeRestaurante = {
      url: this.pedido.origem === 'MERCADOLIVRE' ? 'assets/img/ml.png' : 'assets/img/loja.png',
      scaledSize: scl,
      labelOrigin: new google.maps.Point(10, -10),
    };


    data.entregas.forEach((element) => {
      this.locations.push({ lat: element.latitude, lng: element.longitude });
    });
    this.locations.splice(0, 0, {
      lat: data.vendedorLatitude,
      lng: data.vendedorLongitude,
    });

    this.inicializarMapa();
  }

  kickarEntregador() {
    this.pedidoService
      .kickarEntregador(this.pedidoId)
      .subscribe((response: any) => {
        this.showDialog('Sucesso', 'Entregador kickado com Sucesso');
      });
  }

  bindMapa() {

    const origem: any = {};
    const destino: any = {};

    if ([0, 30, 40, 50, 60, 70].includes(this.pedido.situacao)) {
      origem.icone = this.mapa.iconeRestaurante;
      // destino.icone = this.mapa.iconeCasa;

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
      // destino.icone = this.mapa.iconeCasa;

      origem.latitude = this.pedido.entregadorLatitude;
      origem.longitude = this.pedido.entregadorLongitude;

      destino.latitude = this.pedido.vendedorLatitude;
      destino.longitude = this.pedido.vendedorLongitude;

    }

    origem.posicao = new google.maps.LatLng(origem.latitude, origem.longitude);
    this.mapa.markerOrigem = new google.maps.Marker({
      position: origem.posicao,
      icon: origem.icone,
      map: this.mapa.map
    });

    destino.posicao = new google.maps.LatLng(destino.latitude, destino.longitude);
    // this.mapa.markerDestino = new google.maps.Marker({
    //   position: destino.posicao,
    //   icon: destino.icone,
    //   map: this.mapa.map
    // });


    this.bounds.extend(origem.posicao);
    this.bounds.extend(destino.posicao);
    this.mapa.map.fitBounds(this.bounds);


    const locations = this.locations;
    const lastIndice = locations.length;

    let latitude_destino = locations[lastIndice - 1].lat;
    let longitude_destino = locations[lastIndice - 1].lng;

    this.route(origem.latitude, origem.longitude, latitude_destino, longitude_destino, this.pedido.situacao);
    this.count++;

    window.setTimeout(() => {
      if (this.count) {
        this.carregaPedido();
      }
    }, 60000);

  }

  route(origemLatitude, origemLongitude, destinoLatitude, destinoLongitude, situacao) {
    const start = new google.maps.LatLng(origemLatitude, origemLongitude);
    const end = new google.maps.LatLng(destinoLatitude, destinoLongitude);
    const request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsService.route(request, (result, status) => {

      if (status == google.maps.DirectionsStatus.OK) {

        this.directionsDisplay.setDirections(result);

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
      }
    });
  }

  traceRoute() {
    const locations = this.locations;
    const lastIndice = locations.length;
    let latitude_origem = locations[0].lat;
    let longitude_origem = locations[0].lng;
    let latitude_destino = locations[lastIndice - 1].lat;
    let longitude_destino = locations[lastIndice - 1].lng;

    const posicaoOrigem = new google.maps.LatLng(
      latitude_origem,
      longitude_origem
    );
    this.markerOrigem = new google.maps.Marker({
      position: posicaoOrigem,
      icon: this.mapa.iconeRestaurante,
      map: this.mapa.map,
    });

    const posicaoDestino = new google.maps.LatLng(
      latitude_destino,
      longitude_destino
    );
    this.markerDestino = new google.maps.Marker({
      position: posicaoDestino,
      icon: this.mapa.iconeCasa,
      map: this.mapa.map,
      label: {
        text: locations.length - 1 + ' º',
        fontFamily: 'ROBOTO',
        fontWeight: 'BOLD',
      },
    });

    this.bounds.extend(posicaoOrigem);
    this.bounds.extend(posicaoDestino);
    for (let i = 1; i < locations.length - 1; i++) {
      const posicaoWayPoint = new google.maps.LatLng(
        locations[i].lat,
        locations[i].lng
      );
      this.markerDestino = new google.maps.Marker({
        position: posicaoWayPoint,
        icon: this.mapa.iconeCasa,
        map: this.mapa.map,
        label: { text: i + ' º', fontFamily: 'ROBOTO', fontWeight: 'BOLD' },
      });
      this.bounds.extend(posicaoWayPoint);
    }

    this.mapa.map.fitBounds(this.bounds);
    this.app.tick();
    this.Route(
      latitude_origem,
      longitude_origem,
      latitude_destino,
      longitude_destino,
      locations
    );
  }

  Route(
    latitude_origem,
    longitude_origem,
    latitude_destino,
    longitude_destino,
    mapWayPoints
  ) {
    const start = new google.maps.LatLng(latitude_origem, longitude_origem);
    const end = new google.maps.LatLng(latitude_destino, longitude_destino);

    const waypts = [];
    for (let i = 1; i < mapWayPoints.length - 1; i++) {
      waypts.push({
        location: new google.maps.LatLng(
          mapWayPoints[i].lat,
          mapWayPoints[i].lng
        ),
        stopover: true,
      });
    }

    const request = {
      origin: start,
      destination: end,
      waypoints: waypts,
      travelMode: google.maps.TravelMode.DRIVING,
    };
    this.app.tick();

    this.directionsService.route(request, (result, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        this.directionsDisplay.setDirections(result);
      }
    });
    this.showLoader = false;
  }

  addEntrega() {
    this.showLoader = true;

    this.pedidoService
      .incluirEnvio(this.pedidoId, this.entregaId)
      .subscribe((response: any) => {
        if (response.sucesso) {
          this.showDialog('Sucesso', 'Pedido Adicionado com sucesso');
          this.carregaPedido();
        } else {
          this.showDialog('Erro', response.mensagem);
          this.showLoader = false;
        }
      });
  }

  iniciarPedido() {
    this.showLoader = true;

    this.pedidoService
      .iniciaPedido(this.pedidoId)
      .subscribe((response: any) => {
        if (response.sucesso) {
          this.showDialog('Sucesso', 'Pedido Iniciado com sucesso');
          this.pedidoIniciado = true;
          this.carregaPedido();
        } else {
          this.showDialog('Erro', response.mensagem);
          this.showLoader = false;
        }
      });
  }

  removePedido(entrega) {
    this.showLoader = true;

    this.pedidoService
      .removerenvio(this.pedidoId, entrega.idExterno)
      .subscribe((response: any) => {
        if (response.sucesso) {
          this.showDialog('Sucesso', 'Pedido removido com sucesso');
          this.carregaPedido();
        } else {
          this.showDialog('Erro', response.mensagem);
          this.showLoader = false;
        }
      });
  }

  incluir() {
    this.pedidoService
      .incluirEntregador(this.idEntregador, this.pedidoId)
      .subscribe((response: any) => {
        this.showDialog('Sucesso', 'Entregador incluido com Sucesso');
      });
  }

  cancelarPedido() {
    let dialogRef = this.dialog.open(ConfirmDialogMottu, {
      width: '400px',
      disableClose: true,
      data: { title: 'Cancelar Pedido', message: 'Deseja mesmo cancelar este pedido?' }
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.showLoader = true;

        this.pedidoService
          .cancelarPedido(this.pedidoId)
          .subscribe((response: any) => {
            if (response.sucesso) {
              this.showDialog('Sucesso', 'Pedido cancelado com sucesso');
              this.showLoader = false;
              if (this.pedido.origem === 'MERCADOLIVRE') {
                this.router.navigate(['pedidos/mercadolivre']);
              } else {
                this.router.navigate(['pedidos-andamento']);
              }            } else {
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
        this.pedidoService.finalizarPedido(this.pedidoId).subscribe((response: any) => {
          this.showDialog('Sucesso', 'Pedido Finalizado com Sucesso');
        });
      }
    });
  }


  showDialog(title, message) {
    this.dialog.open(MottuDialog, {
      width: '400px',
      disableClose: true,
      data: { message: { title, body: message } },
    });
  }

  ngOnDestroy() {
    this.count = null;
  }
}
