import { Component, OnInit, ApplicationRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { MatDialog } from '@angular/material';

import { MustMatch } from './../../../shared/utils/must-match.validator';
import Utils from './../../../shared/utils/utils';
import { UserService } from 'src/app/shared/services/user.service';
import { Cadastro } from 'src/app/shared/models/cadastro.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';

declare var google: any;
var autocomplete;
let currentAddress: any;

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  public personalData: FormGroup;
  public documents: FormGroup;
  public companyData: FormGroup;
  public pricing: FormGroup;
  public adressForm: FormGroup;
  public tipoPessoa = 'J';
  public documentoCadastrado = '';
  public isMatriz = true;
  public emailCadastrado = '';
  public allowAddOtherAdress = false;
  public showPricingForm = false;
  public pricingOption = '1';
  public passWordType = 'password';
  public showLoader = true;
  public util = new Utils();
  public currencyOption = { prefix: 'R$ ', thousands: '.', decimal: ',' };
  public phonemask = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public cnpjmask = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  public cpfMask = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private app: ApplicationRef,
    private auth: AuthService,
    private route: Router,
    private dialog: MatDialog
  ) {
    this.personalData = this.fb.group({
      responsavelNome: ['', Validators.required],
      responsavelTelefone: ['', [Validators.required, Validators.pattern('^[0-9 ()+-]+$')]],
      senha: [''],
      confirmPassword: [''],
      email: ['', [Validators.required, Validators.email]],
      nome: ['', Validators.required],
      cnpj: ['', [Validators.required, Validators.pattern('^[0-9 ()+-./]+$')]],
      matriz: [true, Validators.required],
      complemento: [''],
      // telefone: ['', [Validators.required, Validators.pattern('^[0-9 ()+-]+$')]],
      marketplaceRamoId: ['']
    });

    this.adressForm = this.fb.group({
      endereco: ['', Validators.required],
      matriz: [true, Validators.required],
      complemento: [''],
      cep: ['', Validators.required]
    });
    this.companyData = this.fb.group({
      nome: ['', Validators.required],
      cnpj: ['', [Validators.required, Validators.pattern('^[0-9 ()+-./]+$')]],
      telefone: ['', [Validators.required, Validators.pattern('^[0-9 ()+-]+$')]],
    });
    this.pricing = this.fb.group({
      valorChuvaFixo: ['', Validators.required],
      valor1: ['', Validators.required],
      valor2: ['', Validators.required],
      valor3: ['', Validators.required],
      valor4: ['', Validators.required],
      valorBase: ['', Validators.required],
      valorKm: ['', Validators.required],
      valorTotal: ['', Validators.required],
      adicionalChuva: [''],
      tipo: ['']
    });
  }


  ngOnInit() {
    this.loadUserData();
  }

  onSelectionChange(radio) {
    this.pricingOption = radio.value;
    this.pricing = this.util.setFormValidator(radio.value, this.pricing, Validators);
  }

  setPasswordView() {
    this.passWordType = this.passWordType == 'text' ? 'password' : 'text';
  }

  validate(cnpjInput) {
    let cnpj = cnpjInput.value;

    if (this.util.validaCnpj(cnpj)) {
      this.companyData.controls.cnpj.setErrors({ 'incorrect': true });
    }
  }

  validaCpf(cpfInput) {
    let cpf = cpfInput.value;

    if (this.util.validaCpf(cpf)) {
      if (this.personalData.controls.cnpj != undefined) {
        this.personalData.controls.cnpj.setErrors({ 'cpfInvalido': true });
      }
    }
  }

  checkCnpj(cpfInput) {
    const cnpj = {
      Documento: cpfInput.value.replace(/[^\d]+/g, ''),
    };

    if ((cnpj.Documento.length == 11 || cnpj.Documento.length == 14) && cnpj.Documento != this.documentoCadastrado) {
      this.userService.checkCnpj(cnpj).subscribe((response: any) => {
        if (!response.sucesso) {
          if (this.tipoPessoa == 'J') {
            this.companyData.controls.cnpj.setErrors({
              jaExistente: response.mensagem,
            });
          } else if (this.tipoPessoa == 'F') {
            this.personalData.controls.cnpj.setErrors({
              jaExistente: response.mensagem,
            });
          }
        }
      });
    }
  }

  checkEmail() {

    const email = {
      Email: this.personalData.controls.email.value,
    };

    if (email.Email && email.Email != this.emailCadastrado) {
      this.userService.checkEmail(email).subscribe((response: any) => {
        if (!response.sucesso) {
          this.personalData.controls.email.setErrors({
            jaExistente: response.mensagem,
          });
        }
      });
    }
  }

  loadUserData() {
    this.userService.getUserData().subscribe((response: any) => {
      this.initAutocomplete();

      this.tipoPessoa = response.tipoPessoa;
      this.documentoCadastrado = response.cpf;
      this.emailCadastrado = response.email;
      this.isMatriz = response.matriz;

      if (!this.isMatriz) {
        this.personalData.controls.cnpj.setValidators(Validators.nullValidator);
        this.personalData.controls.cnpj.updateValueAndValidity();
      }

      // this.personalData.controls.senha.setValue(response.senha)
      this.personalData.controls.nome.setValue(response.nome);
      this.personalData.controls.responsavelNome.setValue(response.responsavelNome);
      this.personalData.controls.cnpj.setValue(response.cpf);
      this.personalData.controls.email.setValue(response.email);
      this.personalData.controls.marketplaceRamoId.setValue(response.marketplaceRamoId);
      this.personalData.controls.responsavelTelefone.setValue(response.responsavelTelefone);
      this.adressForm.controls.endereco.setValue(response.residenciaRua + ', ' + response.residenciaNumero + ', ' + response.residenciaBairro
        + ', ' + response.residenciaCidade);
      this.adressForm.controls.cep.setValue(response.residenciaCep);
      this.adressForm.controls.complemento.setValue(response.residenciaComplemento);

      //

      this.pricing.controls.tipo.setValue(response.pedidoPrecificacao.tipo);
      this.pricing.controls.valor1.setValue(response.pedidoPrecificacao.valor1);
      this.pricing.controls.valor2.setValue(response.pedidoPrecificacao.valor2);
      this.pricing.controls.valor3.setValue(response.pedidoPrecificacao.valor3);
      this.pricing.controls.valor4.setValue(response.pedidoPrecificacao.valor4);
      this.pricing.controls.valorBase.setValue(response.pedidoPrecificacao.valorBase);
      this.pricing.controls.valorChuvaFixo.setValue(response.pedidoPrecificacao.valorChuvaFixo);
      this.pricing.controls.valorKm.setValue(response.pedidoPrecificacao.valorKm);
      this.pricing.controls.valorTotal.setValue(response.pedidoPrecificacao.valorTotal);
      this.pricingOption = response.pedidoPrecificacao.tipo;

      currentAddress = {};
      currentAddress.bairro = response.residenciaBairro;
      currentAddress.rua = response.residenciaRua;
      currentAddress.numero = response.residenciaNumero;
      currentAddress.latitude = response.residenciaLatitude;
      currentAddress.longitude = response.residenciaLongitude;
      currentAddress.estado = response.residenciaEstado;
      currentAddress.complemento = response.residenciaComplemento;
      currentAddress.cep = response.residenciaCep;
      currentAddress.cidade = response.residenciaCidade;
      this.showLoader = false;
      this.app.tick();
    });
  }

  updateProfile() {
    this.showLoader = true;
    let cadastro = new Cadastro();
    cadastro.cnpj = this.personalData.controls.cnpj.value;
    cadastro.cpf = this.personalData.controls.cnpj.value;
    cadastro.nome = this.personalData.controls.nome.value;
    cadastro.marketplaceRamoId = this.personalData.controls.marketplaceRamoId.value;
    cadastro.cnpj = this.personalData.controls.cnpj.value;
    cadastro.email = this.personalData.controls.email.value;
    cadastro.senha = this.personalData.controls.senha.value;
    cadastro.responsavelTelefone = this.personalData.controls.responsavelTelefone.value;
    cadastro.matriz = this.isMatriz;
    cadastro.responsavelNome = this.personalData.controls.responsavelNome.value;
    cadastro.origem = 'borabora';
    cadastro.pedidoPrecificacaoTipo = this.pricingOption;
    cadastro.addUnidade = false;
    cadastro.tempoPreparo = 0;
    cadastro.endereco = this.adressForm.controls.endereco.value || null;
    cadastro.cep = this.adressForm.controls.cep.value || null;
    cadastro.complemento = this.adressForm.controls.complemento.value || null;
    cadastro.valor1 = this.pricing.controls.valor1.value || null;
    cadastro.valor2 = this.pricing.controls.valor2.value || null;
    cadastro.valor3 = this.pricing.controls.valor3.value || null;
    cadastro.valor4 = this.pricing.controls.valor4.value || null;
    cadastro.valorBase = this.pricing.controls.valorBase.value || null;
    cadastro.valorKm = this.pricing.controls.valorKm.value || null;
    cadastro.valorTotal = this.pricing.controls.valorTotal.value || null;
    cadastro.valorChuvaFixo = this.pricing.controls.valorChuvaFixo.value || null;

    this.userService.register(cadastro, false).subscribe((response) => {
      if (response.sucesso) {
        this.registerAddress();
      } else {
        this.showDialog('Erro', 'Ocorreu um erro na edição do seu perfil, caso o erro persista, entre em contato com o suporte.');
      }
    });
  }

  registerAddress() {

    let addressPayload = {
      ResidenciaBairro: currentAddress.bairro,
      ResidenciaCep: this.adressForm.controls.cep.value.toString(),
      ResidenciaCidade: currentAddress.cidade,
      ResidenciaComplemento: this.adressForm.controls.complemento.value,
      ResidenciaEstado: currentAddress.estado,
      ResidenciaLatitude: currentAddress.latitude,
      ResidenciaLongitude: currentAddress.longitude,
      ResidenciaNumero: currentAddress.numero,
      ResidenciaRua: currentAddress.rua,
      EstadoCivil: null,
      FilhosQuantidade: null
    };
    this.userService.registerAddress(addressPayload).subscribe((response: any) => {
      if (response.sucesso) {
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.auth.setEndereco(response.data.usuario);
        this.showDialog('Sucesso', 'Seu perfil foi alterado com sucesso.');
      } else {
        this.showDialog('Erro', 'Ocorreu um erro na edição do seu perfil, caso o erro persista, entre em contato com o suporte.');
      }

      this.showLoader = false;
    });
  }

  cancelar() {
    this.route.navigate(['/pedidos-andamento']);
  }


  initAutocomplete() {
    var nativeHomeInputBox = document.getElementById('enderecoGoogle');

    autocomplete = new google.maps.places.Autocomplete(nativeHomeInputBox, { types: ['geocode'] });

    autocomplete.setFields(['address_component']);

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
        this.adressForm.controls.cep.setValue('');
        this.adressForm.controls.cep.updateValueAndValidity();
      } else {
        this.adressForm.controls.cep.setValue(cep.long_name);
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
      data: { message: { title: title, body: message } }
    });
  }


}
