import { Component, OnInit, ApplicationRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogDinamica } from 'src/app/shared/dialogs/dialog-dinamica';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { ConfirmDialogMottu } from 'src/app/shared/dialogs/confirm-dialog-mottu';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LojaService } from 'src/app/shared/services/loja.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';

declare var google: any;
var autocomplete;
var currentAddress;
@Component({
  selector: 'app-multilojas',
  templateUrl: './multilojas.component.html',
  styleUrls: ['./multilojas.component.scss']
})
export class MultilojasComponent implements OnInit {

  public adressForm: FormGroup;
  public allowAddOtherAdress = false;
  public inputCep = false;
  public showModal = false;
  public address = [];
  public lojas;
  public matriz;
  public isUserMatriz = this.auth.isUserMatriz;
  public user = this.auth.currentUser;
  public showLoader = true;
  public lojaEmUso = localStorage.getItem('loja');
  public showAddMultiloja;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private app: ApplicationRef,
    private lojasService: LojaService,
    private auth: AuthService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.adressForm = this.fb.group({
      endereco: ['', [Validators.required, Validators.pattern('.*[0-9].*')]],
      matriz: [true],
      complemento: [''],
      cep: [''],
    });

    this.getUnidades();
  }

  setMatriz() {
    if (this.auth.isUserMatriz) {
      this.matriz = this.auth.userLogged;

      this.matriz = {
        id: this.auth.userLogged.id,
        matriz: true,
        nome: this.auth.userLogged.nome,
        telefone: this.auth.userLogged.telefone || null,
        responsavelNome: this.auth.userLogged.responsavelNome,
        responsavelTelefone: this.auth.userLogged.responsavelTelefone,
        residenciaRua: this.auth.userLogged.residenciaRua,
        residenciaNumero: this.auth.userLogged.residenciaNumero,
        residenciaBairro: this.auth.userLogged.residenciaBairro,
        residenciaCidade: this.auth.userLogged.residenciaCidade,
        residenciaEstado: this.auth.userLogged.residenciaEstado,
        pedidoPrecificacao: {
          tipo: this.auth.userLogged.pedidoPrecificacao.tipo
        }
      };
      this.lojas.unshift(this.matriz);
    }
  }

  getUnidades() {
    this.showLoader = true;

    this.lojasService.getLojas().subscribe((response: any) => {
      this.lojas = response.data;
      this.setMatriz();
      this.showLoader = false;
    });
  }

  setUnidade(loja) {
    this.lojaEmUso = loja.id;
    localStorage.setItem('loja', this.lojaEmUso);
  }

  setMultilojaView() {
    this.showAddMultiloja = !this.showAddMultiloja;

    if (!this.showAddMultiloja) {
      this.getUnidades();
    }
  }

  removerUnidade(unidade) {
    let dialogRef = this.dialog.open(ConfirmDialogMottu, {
      width: '400px',
      disableClose: true,
      data: { title: 'Atenção', message: 'Tem certeza que deseja remover esta unidade?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showLoader = true;
        this.userService.removeUnidade(unidade.id).subscribe((result: any) => {
          if (result.sucesso) {
            this.showDialog('Sucesso', 'Unidade removida com sucesso.');
            localStorage.setItem('loja', null);
            this.getUnidades();
          } else {
            this.showDialog('Falha', result.mensagem);
          }
        });
      }
    });
  }


  trocaUnidade() {
    let dialogRef = this.dialog.open(ConfirmDialogMottu, {
      width: '400px',
      disableClose: true,
      data: { title: 'Atenção', message: 'Tem certeza que deseja alterar a sua unidade em uso? As próximas entregas virão com esse endereço' }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  setModalView() {
    this.showModal = !this.showModal;
    if (this.showModal) {
      setTimeout(() => {
        this.initAutocomplete();
      }, 100);
    }
  }

  removeAddress(item) {
    var index = this.address.indexOf(item);
    this.address.splice(index, 1);
  }

  initAutocomplete() {
    var nativeHomeInputBox = document.getElementsByTagName('input')[1];

    autocomplete = new google.maps.places.Autocomplete(nativeHomeInputBox, { types: ['geocode'] });

    autocomplete.setFields(['address_component']);
    //autocomplete.addListener('place_changed', this.fillInAddress);

    google.maps.event.addListener(autocomplete, 'place_changed', () => {

      this.allowAddOtherAdress = true;

      var places = autocomplete.getPlace();
      let cep = places.address_components.find(x => { return x.types[0] == 'postal_code'; });
      let numero = places.address_components.find(x => { return x.types[0] == 'street_number'; });
      let rua = places.address_components.find(x => { return x.types[0] == 'route'; });
      let bairro = places.address_components.find(x => { return x.types[0] == 'sublocality_level_1'; });
      let cidade = places.address_components.find(x => { return x.types[0] == 'administrative_area_level_2'; });
      let estado = places.address_components.find(x => { return x.types[0] == 'administrative_area_level_1'; });

      currentAddress = {
        cep: cep ? cep.short_name : '',
        numero: numero ? numero.long_name : '',
        rua: rua.long_name,
        bairro: bairro.long_name,
        estado: estado.short_name,
        cidade: cidade.long_name
      };
      if (!cep) {
        this.adressForm.controls.cep.setValidators(Validators.required);
        this.adressForm.controls.cep.updateValueAndValidity();
        this.inputCep = true;
      } else {
        this.inputCep = false;
        this.adressForm.controls.cep.setValidators(Validators.nullValidator);
        this.adressForm.controls.cep.updateValueAndValidity();
      }

      this.app.tick();

      let geocoder = new google.maps.Geocoder();
      let address = currentAddress.rua + ', ' + currentAddress.numero + ' - ' + currentAddress.bairro +
        ' - ' + currentAddress.cidade + ' - ' + currentAddress.estado + ' - ' + 'Brasil' + ' - ' + currentAddress.cep;

      geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          currentAddress.latitude = results[0].geometry.location.lat().toFixed(7).toString();
          currentAddress.longitude = results[0].geometry.location.lng().toFixed(7).toString();
        } else {
          alert(results);
        }
      });
    });
  }

  showDialog(title, message) {
    this.dialog.open(MottuDialog, {
      width: '400px',
      disableClose: true,
      data: { message: { title, body: message } }
    });
  }

}
