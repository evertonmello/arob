import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatStepper, MatDialog } from '@angular/material';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Mapa } from './../../../../shared/models/mapa.models';

import { PedidoService } from '../../../../shared/services/pedido.service';
import { Pedido } from '../../../../shared/models/pedido.model';
import { FilePickerComponent } from './../../file-picker/file-picker.component';
import { Endereco } from 'src/app/shared/models/endereco.models';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { PrecificacaoDialog } from 'src/app/shared/dialogs/preficicacao';
import { LojaService } from 'src/app/shared/services/loja.service';

declare var google: any;
var autocomplete;

@Component({
  selector: 'app-novo-pedido',
  templateUrl: './novo-pedido.component.html',
  styleUrls: ['./novo-pedido.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class NovoPedidoComponent implements OnInit {
  public mercadoFlex = false;
  public blockPedido = false;
  public isLinear = false;
  public dadosCliente: FormGroup;
  public inputCep = false;
  public allowAddOtherAdress = false;
  public currentAddress: Endereco;
  public mapa = new Mapa();
  public enderecoPreenchido;
  public allowRequest = false;
  public origin = { lat: 0, lng: 0 };
  public dest = { lat: 0, lng: 0 };
  public showRoute = false;
  public showEnderecoLoader = false;
  public novoPedidoLoader = false;
  public user;
  public distanciaTotal = 0;
  public distanciaPedido;
  public valorPedido;
  public valoresPedidoRoteirizado = [];
  public temValorMinimo = false;
  public lojaSelectedId;
  public lojaEmUso = localStorage.getItem('loja') ? Number(localStorage.getItem('loja')) : null;
  public showLoader = true;
  public isMatriz = this.authService.isUserMatriz;
  public precificacaoSelected;
  public lojaSelected;
  public precificacoes = [{ value: 'raio', label: 'Por Raio' }, { value: 'km', label: 'Por Quilometragem' }, { value: 'fixo', label: 'Valor fixo' }];
  public renderOptions = {
    suppressMarkers: true,
  };
  public rotas = [];
  public lojas;
  public wayPointsMap = [];
  public waypoints = [{
    celular: '',
    cep: '',
    complemento: '',
    endereco: '',
    nome: '',
    numeroPedido: 0,
    lat: null,
    lng: null,
    rua: null,
    numero: null,
    bairro: null,
    cidade: null,
    estado: null
  }];
  public enderecoRetirada = {
    lat: 0, lng: 0
  };
  public phonemask = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  @ViewChild('stepper', { static: false }) stepper: MatStepper;

  constructor(
    private _formBuilder: FormBuilder,
    private app: ApplicationRef,
    private pedidoService: PedidoService,
    private router: Router,
    public dialog: MatDialog,
    private lojasService: LojaService,
    private authService: AuthService
  ) {
    this.initComponent();
  }

  ngOnInit() {
    this.checkDocs();
  }

  initComponent() {
    this.user = this.authService.userLogged;
    this.currentAddress = new Endereco();
    this.enderecoRetirada = JSON.parse(localStorage.getItem('cordenadas'));
    this.origin = this.enderecoRetirada;
    this.dest = this.enderecoRetirada;
    this.waypoints[0].endereco = localStorage.getItem('endereco');
    this.dadosCliente = this._formBuilder.group({
      numeroPedido: ['', Validators.required],
      nome: ['', Validators.required],
      celular: ['', [Validators.required]],
      endereco: ['', [Validators.required, Validators.pattern('.*[0-9].*'), Validators.minLength(10000)]],
      cep: [''],
      complemento: [''],
      lat: [''],
      lng: [''],
      vendedorId: [''],
      bairro: [{ value: '', disabled: true }, ],
      cidade: [{ value: '', disabled: true }, ],
      estado: [{ value: '', disabled: true }, ],
      numero: [{ value: '', disabled: true }, ],
      rua: ['']
    });
  }


  checkDocs() {
    this.pedidoService.checkDoc().subscribe((response: any) => {
      if (response.sucesso) {
        if (response.data.bloqueado) {
          this.blockPedido = true;
          this.initDocs();
        } else {
          this.getUnidades();
        }
      }
    });
  }

  getUnidades() {
    this.lojasService.getLojas().subscribe((response: any) => {
      this.lojas = response.data;
      this.showLoader = false;

      if (this.lojaEmUso) {
        this.lojaSelected = this.lojas.filter((item) => { return item.id == this.lojaEmUso; });
        this.lojaSelected = this.lojaSelected[0];
        this.setEstabelecimento();
      }
    });
  }

  setEstabelecimento() {
    // caso o usuario troque unidade é resetado o fluxo
    if (this.showRoute || this.currentAddress.latitude) {
      this.resetMap();
    }
    if (this.lojaSelected) {
      let lojaS = this.lojaSelected;
      this.waypoints[0].endereco = lojaS.residenciaRua + ', ' + lojaS.residenciaNumero + ', ' +
        lojaS.residenciaBairro + ', ' + lojaS.residenciaCidade + ', ' + lojaS.residenciaEstado + ' - ' + lojaS.residenciaCep;
      this.enderecoRetirada = {
        lat: parseFloat(this.lojaSelected.residenciaLatitude),
        lng: parseFloat(this.lojaSelected.residenciaLongitude)
      };
      this.origin = this.enderecoRetirada;
      this.dest = this.enderecoRetirada;
    }



  }

  resetMap() {
    this.allowAddOtherAdress = false;
    this.showRoute = false;
    this.wayPointsMap = [];
    this.waypoints = [{
      celular: '',
      cep: '',
      complemento: '',
      endereco: '',
      nome: '',
      numeroPedido: 0,
      lat: null,
      lng: null,
      rua: null,
      numero: null,
      bairro: null,
      cidade: null,
      estado: null
    }];
    this.dadosCliente.reset();
    this.stepper.reset();
    this.stepper.selectedIndex = 1;
  }

  setPrecificacao() {
    var dialogRef = this.dialog.open(PrecificacaoDialog, {
      width: '700px',
      disableClose: false,
      data: true
    });
  }

  setMask(phone) {
    if (phone.value.match('_') && phone.value.match('_').index == 14) {
      this.dadosCliente.controls.celular.setValidators(Validators.nullValidator);
    } else {
      if (phone.value[14] != '_' && !phone.value.match('_')) {
        this.dadosCliente.controls.celular.setValidators(Validators.nullValidator);
      } else {
        this.dadosCliente.controls.celular.setErrors({ 'incorrect': true });
      }
    }

    if (phone.value == '') {
      this.dadosCliente.controls.celular.setErrors({ 'incorrect': true });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initAutocomplete();
      this.stepper.selectedIndex = 1;
    }, 50);
  }

  initDocs() {
    if (!this.allowRequest) {
      var dialogRef = this.dialog.open(FilePickerComponent, {
        width: '700px',
        disableClose: false,
        data: true
      });

      dialogRef.componentInstance.onAdd.subscribe(() => {
        dialogRef.close();
      });
    }
  }

  cancelarNovoEnd() {
    this.dadosCliente.setValue(this.waypoints[this.waypoints.length - 1]);
    this.waypoints.pop();
    this.dadosCliente.controls.endereco.setErrors(null);

    if (this.wayPointsMap.length > 0) {
      let lat = this.wayPointsMap[this.wayPointsMap.length - 1]['location'].lat;
      let lng = this.wayPointsMap[this.wayPointsMap.length - 1]['location'].lng;

      this.currentAddress.latitude = lat;
      this.currentAddress.longitude = lng;
      this.setMapPointer(lat, lng);
      this.wayPointsMap.pop();
    }

    //checa se nao remove valor do array antes de ser acrescentado
    if (this.stepper.selectedIndex - 1 != this.valoresPedidoRoteirizado.length) {
      this.valoresPedidoRoteirizado.pop();
    }

    this.rotas.pop();
    this.app.tick();

  }

  setMapPointer(lat, lng) {
    this.dest = { lat: parseFloat(lat), lng: parseFloat(lng) };
    this.showRoute = true;
    this.app.tick();
  }

  addDestino() {
    this.enderecoPreenchido = false;
    let pedido = this.dadosCliente.value;
    pedido['lat'] = parseFloat(this.currentAddress.latitude);
    pedido['lng'] = parseFloat(this.currentAddress.longitude);
    pedido['rua'] = this.currentAddress.rua;
    pedido['numero'] = this.currentAddress.numero;
    pedido['bairro'] = this.currentAddress.bairro;
    pedido['cep'] = this.currentAddress.cep;
    pedido['cidade'] = this.currentAddress.cidade;
    pedido['estado'] = this.currentAddress.estado;

    this.waypoints.push(pedido);
    this.dadosCliente.reset();
    setTimeout(() => {
      this.stepper.selectedIndex = this.waypoints.length;
    }, 50);

  }

  initAutocomplete() {
    var nativeHomeInputBox = document.getElementById('endereco-novo-pedido');
    autocomplete = new google.maps.places.Autocomplete(nativeHomeInputBox, { types: ['geocode'] });

    autocomplete.setFields(['address_component']);

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      this.onEnderecoChanges();
    });
  }

  onEnderecoChanges() {
    this.showEnderecoLoader = true;

    this.allowAddOtherAdress = true;

    var places = autocomplete.getPlace();
    let cep = places.address_components.find(x => { return x.types[0] == 'postal_code'; });
    let numero = places.address_components.find(x => { return x.types[0] == 'street_number'; });
    let rua = places.address_components.find(x => { return x.types[0] == 'route'; });
    let bairro = places.address_components.find(x => { return x.types[0] == 'sublocality_level_1'; });
    let cidade = places.address_components.find(x => { return x.types[0] == 'administrative_area_level_2'; });
    let estado = places.address_components.find(x => { return x.types[0] == 'administrative_area_level_1'; });

    this.currentAddress.cep = cep ? cep.short_name : '',
      this.currentAddress.numero = numero ? numero.long_name : '',
      this.currentAddress.rua = rua.long_name,
      this.currentAddress.bairro = bairro.long_name,
      this.currentAddress.estado = estado.short_name,
      this.currentAddress.cidade = cidade.long_name;

    if (!cep) {
      this.dadosCliente.controls.cep.setValidators(Validators.required);
      this.dadosCliente.controls.cep.updateValueAndValidity();
      this.inputCep = true;
    } else {
      this.inputCep = false;
      this.dadosCliente.controls.cep.setValidators(Validators.nullValidator);
      this.dadosCliente.controls.cep.updateValueAndValidity();
    }

    this.dadosCliente.controls.numero.setValue(this.currentAddress.numero);
    this.dadosCliente.controls.bairro.setValue(this.currentAddress.bairro);
    this.dadosCliente.controls.cidade.setValue(this.currentAddress.cidade);
    this.dadosCliente.controls.estado.setValue(this.currentAddress.estado);

    this.app.tick();

    let geocoder = new google.maps.Geocoder();
    let address = this.currentAddress.rua + ', ' + this.currentAddress.numero + ' - ' + this.currentAddress.bairro +
      ' - ' + this.currentAddress.cidade + ' - ' + this.currentAddress.estado + ' - ' + 'Brasil' + ' - ' + this.currentAddress.cep;

    this.dadosCliente.controls.endereco.setErrors(null);

    geocoder.geocode({ 'address': address }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        this.currentAddress.latitude = results[0].geometry.location.lat().toFixed(7).toString();
        this.currentAddress.longitude = results[0].geometry.location.lng().toFixed(7).toString();
        this.setMapPointer(this.currentAddress.latitude, this.currentAddress.longitude);
        this.showEnderecoLoader = false;
        this.enderecoPreenchido = true;

        this.calculateDistance();

        if (this.waypoints.length > 1) {
          let lat = this.waypoints[this.waypoints.length - 1]['lat'];
          let lng = this.waypoints[this.waypoints.length - 1]['lng'];
          if (this.wayPointsMap.length >= this.stepper.selectedIndex - 1) {
            this.wayPointsMap[this.wayPointsMap.length - 1].location = { lat: lat, lng: lng, address: this.currentAddress };
          } else {
            this.wayPointsMap.push({
              location: { lat: lat, lng: lng, address: this.currentAddress }
            });
          }
        }
      }
    });
  }

  criarPedido() {
    this.novoPedidoLoader = true;

    if (this.waypoints.length > 1) {
      this.criaPedidoRoteirizado();
    } else {
      const pedido = new Pedido();
      pedido.EntregaLatitude = this.currentAddress.latitude;
      pedido.EntregaLongitude = this.currentAddress.longitude;
      pedido.bairro = this.currentAddress.bairro;
      pedido.cep = this.currentAddress.cep || this.dadosCliente.controls.cep.value.toString();
      pedido.cidade = this.currentAddress.cidade;
      pedido.estado = this.currentAddress.estado;
      pedido.numero = this.currentAddress.numero;
      pedido.complemento = this.dadosCliente.controls.complemento.value;
      pedido.rua = this.currentAddress.rua;
      pedido.codigoExterno = this.dadosCliente.controls.numeroPedido.value;
      pedido.telefone = this.dadosCliente.controls.celular.value;
      pedido.nome = this.dadosCliente.controls.nome.value;

      if (this.lojaSelected && this.lojaSelected.id != this.user.id) {
        pedido.vendedorId = this.lojaSelected.id;
      }
      if (this.mostrarMercadoFlex() && this.mercadoFlex) {
        pedido.origem = 'MERCADOLIVRE';
      }
      this.pedidoService.addPedido(pedido).subscribe((result: any) => {
        this.novoPedidoLoader = false;
        if (result.sucesso) {
          this.dialog.open(MottuDialog, {
            width: '400px',
            disableClose: true,
            data: { message: { title: 'Sucesso', body: 'Pedido criado com sucesso' } }
          });
          this.router.navigate(['/pedidos-andamento']);
        } else {
          this.dialog.open(MottuDialog, {
            width: '400px',
            disableClose: false,
            data: { message: { title: 'Falha', body: result.mensagem } }
          });
        }
      });
    }
  }

  marcarFlex(valor) {
    this.mercadoFlex = valor;
  }

  criaPedidoRoteirizado() {
    this.addDestino();
    let pedidos = [];

    this.waypoints.forEach(item => {
      let pedido = new Pedido();
      pedido.EntregaLatitude = item.lat;
      pedido.EntregaLongitude = item.lng;
      pedido.bairro = item.bairro;
      pedido.cidade = item.cidade;
      pedido.estado = item.estado;
      pedido.rua = item.rua;
      pedido.numero = item.numero;
      pedido.complemento = item.complemento;
      pedido.codigoExterno = item.numeroPedido.toString();
      pedido.telefone = item.celular;
      pedido.nome = item.nome;
      pedido.cep = item.cep;
      pedido.codigoExterno = item.numeroPedido.toString();
      if (this.lojaSelected && this.lojaSelected.id != this.user.id) {
        pedido.vendedorId = this.lojaSelected.id;
      }
      if (this.mostrarMercadoFlex() && this.mercadoFlex) {
        pedido.origem = 'MERCADOLIVRE';
      }
      pedidos.push(pedido);
    });


    pedidos.shift();

    this.pedidoService.addPedidoRoteirizado(pedidos).subscribe((response) => {
      this.novoPedidoLoader = false;
      this.dialog.open(MottuDialog, {
        width: '400px',
        disableClose: true,
        data: { message: { title: 'Sucesso', body: 'Pedido criado com sucesso' } }
      });
      this.router.navigate(['/pedidos-andamento']);
    }, (error) => {
      this.novoPedidoLoader = false;

      this.dialog.open(MottuDialog, {
        width: '400px',
        disableClose: true,
        data: { message: { title: 'Sucesso', body: error.mensagem } }
      });
    });
  }

  mostrarMercadoFlex() {
    return (this.lojaSelected && this.lojaSelected.marketplaceRamoId == 2);
  }

  calculateDistance() {
    this.showLoader = true;
    let pushValue = false;
    if (this.rotas.length == 0 || this.stepper.selectedIndex == 1) {
      this.rotas = [];
      this.rotas.push({
        'Origem': this.enderecoRetirada.lat.toString() + ',' + this.enderecoRetirada.lng.toString(),
        'Destino': this.currentAddress.latitude + ',' + this.currentAddress.longitude,
      });
      pushValue = true;
    } else {
      if (this.stepper.selectedIndex - 1 == this.rotas.length) {
        this.rotas.push({
          'Origem': this.rotas[this.rotas.length - 1].Destino,
          'Destino': this.currentAddress.latitude + ',' + this.currentAddress.longitude
        });
        pushValue = true;

      } else {
        this.rotas[this.rotas.length - 1].Origem = this.rotas[this.rotas.length - 2].Destino;
        this.rotas[this.rotas.length - 1].Destino = this.currentAddress.latitude + ',' + this.currentAddress.longitude;
      }
    }

    this.pedidoService.calculaValorPedido(this.rotas).subscribe((response: any) => {
      if (response.data) {
        this.gerenciaValorPedido(response, pushValue);
      } else {
        this.dialog.open(MottuDialog, {
          width: '400px',
          disableClose: false,
          data: { message: { title: 'Falha', body: response.mensagem } }
        });
      }
      this.showLoader = false;
      this.app.tick();
    });

  }

  gerenciaValorPedido(response, pushValue) {
    this.valorPedido = response.data.valorCorrida;
    if (pushValue) {
      this.valoresPedidoRoteirizado.push(this.valorPedido);
    } else {
      this.valoresPedidoRoteirizado[this.valoresPedidoRoteirizado.length - 1] = this.valorPedido;
    }
  }

}
