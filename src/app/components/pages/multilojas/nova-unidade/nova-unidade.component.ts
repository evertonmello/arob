import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CadastroUnidade } from 'src/app/shared/models/cadastroUnidade.model';
import { UserService } from 'src/app/shared/services/user.service';
import Utils from './../../../../shared/utils/utils';
import { AuthService } from 'src/app/shared/services/auth.service';

declare var google: any;
let autocomplete;
let currentAddress;

@Component({
  selector: 'nova-unidade',
  templateUrl: './nova-unidade.component.html',
  styleUrls: ['./nova-unidade.component.scss']
})
export class NovaUnidadeComponent implements OnInit {

  public adressForm: FormGroup;
  public showLoader = false;
  public companyData: FormGroup;
  public pricingOption = '2';
  public address = [];
  public inputCep = false;
  public allowAddOtherAdress = false;
  public utils = new Utils();
  public allowNextEmail;
  public currencyOption = { prefix: 'R$ ', thousands: '.', decimal: ',' };
  @Output('setMultilojaView') setMultilojaView = new EventEmitter();
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.companyData = this.fb.group({
      marketplaceRamoId: ['', Validators.required],
      nome: ['', Validators.required],
      cnpj: [''],
      cpf: ['', [Validators.pattern('^[0-9 ()+-./]+$')]],
      telefone: ['', Validators.required],
      tipoPessoa: ['1'],
      responsavelNome: ['', Validators.required],
      responsavelTelefone: ['', Validators.required],
      senha: ['', Validators.required],
      confirmPassword: [''],
      email: ['', [Validators.required, Validators.email]],
      valorChuvaFixo: [''],
      valor1: ['', Validators.required],
      valor2: ['', Validators.required],
      valor3: ['', Validators.required],
      valor4: ['', Validators.required],
      valorBase: ['0.01'],
      valorKm: ['1'],
      valorTotal: ['', Validators.required],
      adicionalChuva: ['']
    });

    this.adressForm = this.fb.group({
      endereco: ['', [Validators.required, Validators.pattern('.*[0-9].*')]],
      matriz: [true],
      complemento: [''],
      cep: [''],
    });
  }

  ngOnInit() {
    this.initAutocomplete();
    this.onSelectionChange({ value: 2 })
  }

  get companyDataForm() {
    return this.companyData.controls;
  }


  onSelectionChange(radio) {
    this.pricingOption = radio.value;
    this.companyData = this.utils.setFormValidator(
      radio.value,
      this.companyData,
      Validators
    );
  }

  addAddress() {
    this.address.push(currentAddress);
    this.adressForm.reset();
  }

  removeAddress(item) {
    const index = this.address.indexOf(item);
    this.address.splice(index, 1);
  }

  validarEndereco() {
    if (this.adressForm.controls.endereco.value == '') {
      this.allowAddOtherAdress = false;
    }
  }

  sendToRegister() {
    this.showLoader = true;
    const cadastro = new CadastroUnidade();
    cadastro.cpf = this.companyData.controls.cpf.value || this.companyData.controls.cnpj.value;
    cadastro.nome = this.companyData.controls.nome.value;
    cadastro.marketplaceRamoId = this.companyData.controls.marketplaceRamoId.value;
    cadastro.email = this.companyData.controls.email.value;
    cadastro.senha = this.companyData.controls.senha.value;
    cadastro.responsavelTelefone = this.companyData.controls.responsavelTelefone.value;
    cadastro.matriz = false;
    cadastro.responsavelNome = this.companyData.controls.responsavelNome.value;
    cadastro.origem = 'borabora';
    cadastro.pedidoPrecificacaoTipo = this.pricingOption;
    cadastro.addUnidade = false;
    cadastro.addUnidade = true;
    cadastro.tempoPreparo = 0;
    cadastro.valor1 = this.companyData.controls.valor1.value || null;
    cadastro.valor2 = this.companyData.controls.valor2.value || null;
    cadastro.valor3 = this.companyData.controls.valor3.value || null;
    cadastro.valor4 = this.companyData.controls.valor4.value || null;
    cadastro.valorBase = this.companyData.controls.valorBase.value || null;
    cadastro.valorKm = this.companyData.controls.valorKm.value || null;
    cadastro.valorTotal = this.companyData.controls.valorTotal.value || null;
    cadastro.valorChuvaFixo =
      this.companyData.controls.valorChuvaFixo.value || null;
    cadastro.ResidenciaBairro = currentAddress.bairro,
      cadastro.ResidenciaCep =
      currentAddress.cep || this.adressForm.controls.cep.value.toString();
    cadastro.ResidenciaCidade = currentAddress.cidade;
    cadastro.ResidenciaComplemento = this.adressForm.controls.complemento.value;
    cadastro.ResidenciaEstado = currentAddress.estado;
    cadastro.ResidenciaLatitude = currentAddress.latitude;
    cadastro.ResidenciaLongitude = currentAddress.longitude;
    cadastro.ResidenciaNumero = currentAddress.numero;
    cadastro.ResidenciaRua = currentAddress.rua;
    cadastro.EstadoCivil = null;
    cadastro.FilhosQuantidade = null;

    this.userService.addUnidade(cadastro).subscribe((response) => {
      this.showLoader = false;
      this.setMultilojaView.emit();
    });
  }

  validateRespPhone(phone) {
    if (phone.value.match('_') && phone.value.match('_').index == 14) {
      this.companyData.controls.responsavelTelefone.setValidators(
        Validators.nullValidator
      );
    } else {
      if (phone.value[14] != '_' && !phone.value.match('_')) {
        this.companyData.controls.responsavelTelefone.setValidators(
          Validators.nullValidator
        );
      } else {
        this.companyData.controls.responsavelTelefone.setErrors({
          incorrect: true,
        });
      }
    }
  }

  validate(cnpjInput) {
    let cnpj = cnpjInput.value;

    if (this.utils.validaCnpj(cnpj)) {
      this.companyData.controls.cnpj.setErrors({ cnpjInvalido: true });
    }
  }

  validaCpf(cpfInput) {
    let cpf = cpfInput.value;

    if (this.utils.validaCpf(cpf)) {
      this.companyData.controls.cpf.setErrors({ cpfInvalido: true });
    }
  }

  checkEmail() {
    this.allowNextEmail = false;

    const email = {
      Email: this.companyData.controls.email.value,
    };
    this.userService.checkEmail(email).subscribe((response: any) => {
      if (!response.sucesso) {
        this.companyData.controls.email.setErrors({
          jaExistente: response.mensagem,
        });
      } else {
        this.allowNextEmail = true;
      }
    });
  }

  initAutocomplete() {
    const nativeHomeInputBox = document.getElementById('enderecoNovaLoja');

    autocomplete = new google.maps.places.Autocomplete(nativeHomeInputBox, {
      types: ['geocode'],
    });

    autocomplete.setFields(['address_component']);

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      this.allowAddOtherAdress = true;

      const places = autocomplete.getPlace();
      const cep = places.address_components.find((x) => {
        return x.types[0] == 'postal_code';
      });
      const numero = places.address_components.find((x) => {
        return x.types[0] == 'street_number';
      });
      const rua = places.address_components.find((x) => {
        return x.types[0] == 'route';
      });
      const bairro = places.address_components.find((x) => {
        return x.types[0] == 'sublocality_level_1';
      });
      const cidade = places.address_components.find((x) => {
        return x.types[0] == 'administrative_area_level_2';
      });
      const estado = places.address_components.find((x) => {
        return x.types[0] == 'administrative_area_level_1';
      });

      currentAddress = {
        cep: cep ? cep.short_name : '',
        numero: numero ? numero.long_name : '',
        rua: rua.long_name,
        bairro: bairro.long_name,
        estado: estado.short_name,
        cidade: cidade.long_name,
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


      const geocoder = new google.maps.Geocoder();
      const address =
        currentAddress.rua +
        ', ' +
        currentAddress.numero +
        ' - ' +
        currentAddress.bairro +
        ' - ' +
        currentAddress.cidade +
        ' - ' +
        currentAddress.estado +
        ' - ' +
        'Brasil' +
        ' - ' +
        currentAddress.cep;

      geocoder.geocode({ address }, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          currentAddress.latitude = results[0].geometry.location
            .lat()
            .toFixed(7)
            .toString();
          currentAddress.longitude = results[0].geometry.location
            .lng()
            .toFixed(7)
            .toString();
        }
      });
    });
  }


}
