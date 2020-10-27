import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';
import { Router } from '@angular/router';

import { Cadastro } from './../../../shared/models/cadastro.model';
import { UserService } from '../../../shared/services/user.service';
import { MustMatch } from './../../../shared/utils/must-match.validator';
import { AuthService } from '../../../shared/services/auth.service';
import Utils from './../../../shared/utils/utils';
import { CupomDialog } from 'src/app/shared/dialogs/cupom-dialog';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { CadastroDialog } from 'src/app/shared/dialogs/cadastro-dialog';

declare var google: any;
let autocomplete;
let currentAddress;
@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class CadastroComponent implements OnInit {
  @ViewChild('stepper', { static: false }) stepper: MatStepper;

  public personalData: FormGroup;
  public documents: FormGroup;
  public companyData: FormGroup;
  public pricing: FormGroup;
  public adressForm: FormGroup;
  public isOptional = false;
  public pricingOption = '2';
  public selectFormControl = new FormControl('', Validators.required);
  public companyArea;
  public manualCep;
  public showLoader = false;
  public inputCep = false;
  public allowAddOtherAdress = false;
  public disableCadastro = true;
  public address = [];

  public currencyOption = { prefix: 'R$ ', thousands: '.', decimal: ',' };
  get perDataF() {
    return this.personalData.controls;
  }
  public util = new Utils();
  public allowNextEmail;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private app: ApplicationRef,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.personalData = this.fb.group(
      {
        responsavelNome: ['', Validators.required],
        responsavelTelefone: ['', Validators.required],
        senha: ['', Validators.required],
        confirmPassword: [''],
        email: ['', [Validators.required, Validators.email]],
      },
      {
        validator: MustMatch('senha', 'confirmPassword'),
      }
    );

    this.adressForm = this.fb.group({
      endereco: ['', [Validators.required, Validators.pattern('.*[0-9].*')]],
      matriz: [true],
      complemento: [''],
      cep: [''],
      cidade: [{ value: '', disabled: true }],
      estado: [{ value: '', disabled: true }],
      numero: [{ value: '', disabled: true }]
    });
    this.companyData = this.fb.group({
      nome: ['', Validators.required],
      cnpj: ['', [Validators.pattern('^[0-9 ()+-./]+$')]],
      cpf: ['', [Validators.required, Validators.pattern('^[0-9 ()+-./]+$')]],
      telefone: ['', Validators.required],
      tipoPessoa: ['1'],
      entregasDia: ['1'],
    });
    this.pricing = this.fb.group({
      valorChuvaFixo: [''],
      valor1: ['', Validators.required],
      valor2: ['', Validators.required],
      valor3: ['', Validators.required],
      valor4: ['', Validators.required],
      valorBase: ['9.00'],
      valorKm: ['1'],
      valorTotal: ['', Validators.required],
      adicionalChuva: [''],
    });
    this.documents = this.fb.group({});
    this.onSelectionChange({ value: '2' });
  }

  stepperChange() {
    if (this.stepper.selectedIndex == 1) {
      this.initAutocomplete();
    }
  }

  setTipoEmpresa(tipo) {
    this.companyArea = tipo;
    this.openInfoDialog();
  }

  openInfoDialog() {
    const dialogRef = this.dialog.open(CadastroDialog, {
      width: '800px',
      height: '500px'
    });
  }

  checkEmail() {
    this.allowNextEmail = false;

    const email = {
      Email: this.personalData.controls.email.value,
    };
    this.userService.checkEmail(email).subscribe((response: any) => {
      if (!response.sucesso) {
        this.personalData.controls.email.setErrors({
          jaExistente: response.mensagem,
        });
      } else {
        this.allowNextEmail = true;
      }
    });
  }

  checkPasswords(group: FormGroup) {
    const pass = group.controls.senha.value;
    const confirmPass = group.controls.confirmPass.value;

    return pass === confirmPass ? null : { notSame: true };
  }

  validatePhone(phone) {
    if (phone.value.match('_') && phone.value.match('_').index == 14) {
      this.companyData.controls.telefone.setValidators(
        Validators.nullValidator
      );
    } else {
      if (phone.value[14] != '_' && !phone.value.match('_')) {
        this.companyData.controls.telefone.setValidators(
          Validators.nullValidator
        );
      } else {
        this.companyData.controls.telefone.setErrors({ incorrect: true });
      }
    }
    if (phone.value == '') {
      this.companyData.controls.telefone.setErrors({ incorrect: true });
    }
  }

  validateRespPhone(phone) {
    if (phone.value.match('_') && phone.value.match('_').index == 14) {
      this.personalData.controls.responsavelTelefone.setValidators(
        Validators.nullValidator
      );
    } else {
      if (phone.value[14] != '_' && !phone.value.match('_')) {
        this.personalData.controls.responsavelTelefone.setValidators(
          Validators.nullValidator
        );
      } else {
        this.personalData.controls.responsavelTelefone.setErrors({
          incorrect: true,
        });
      }
    }

    if (phone.value == '') {
      this.personalData.controls.responsavelTelefone.setErrors({
        incorrect: true,
      });
    }
  }

  addAddress() {
    this.address.push(currentAddress);
    this.adressForm.reset();
  }

  removeAddress(item) {
    const index = this.address.indexOf(item);
    this.address.splice(index, 1);
  }

  onSelectionChange(radio) {
    this.pricingOption = radio.value;
    this.pricing = this.util.setFormValidator(
      radio.value,
      this.pricing,
      Validators
    );
  }

  sendToRegister() {
    this.showLoader = true;
    const cadastro = new Cadastro();
    cadastro.cpf = this.companyData.controls.cpf.value || this.companyData.controls.cnpj.value;
    cadastro.nome = this.companyData.controls.nome.value;
    cadastro.qtdEntregasDia = this.companyData.controls.entregasDia.value || null;
    cadastro.marketplaceRamoId = this.companyArea.toString();
    cadastro.email = this.personalData.controls.email.value;
    cadastro.senha = this.personalData.controls.senha.value;
    cadastro.responsavelTelefone = this.personalData.controls.responsavelTelefone.value;
    cadastro.matriz = true;
    cadastro.responsavelNome = this.personalData.controls.responsavelNome.value;
    cadastro.origem = 'borabora';
    cadastro.pedidoPrecificacaoTipo = this.pricingOption;
    cadastro.addUnidade = false;
    cadastro.tempoPreparo = 0;
    cadastro.valor1 = this.pricing.controls.valor1.value || null;
    cadastro.valor2 = this.pricing.controls.valor2.value || null;
    cadastro.valor3 = this.pricing.controls.valor3.value || null;
    cadastro.valor4 = this.pricing.controls.valor4.value || null;
    cadastro.valorBase = this.getValorBase();
    cadastro.valorKm = this.pricing.controls.valorKm.value || null;
    cadastro.valorTotal = this.pricing.controls.valorTotal.value || null;
    cadastro.valorChuvaFixo = this.pricing.controls.valorChuvaFixo.value || null;
    this.stepper.selectedIndex = 4;

    this.userService.register(cadastro, false).subscribe((response) => {
      this.registerAddress();
    });
  }

  getValorBase() {
    if (this.companyArea == '1') {
      return this.pricing.controls.valorBase.value || null;
    } else {
      return 0;
    }
  }

  registerAddress() {
    const addressPayload = {
      ResidenciaBairro: currentAddress.bairro,
      ResidenciaCep: currentAddress.cep || this.adressForm.controls.cep.value.toString(),
      ResidenciaCidade: currentAddress.cidade,
      ResidenciaComplemento: this.adressForm.controls.complemento.value,
      ResidenciaEstado: currentAddress.estado,
      ResidenciaLatitude: currentAddress.latitude,
      ResidenciaLongitude: currentAddress.longitude,
      ResidenciaNumero: currentAddress.numero,
      ResidenciaRua: currentAddress.rua,
      EstadoCivil: null,
      FilhosQuantidade: null,
    };
    this.stepper.selectedIndex = 4;

    this.userService.registerAddress(addressPayload).subscribe((result) => {
      this.showLoader = false;

      this.authService.currentUserSubject.next(true);
      localStorage.setItem('currentUser', JSON.stringify(result));
      this.authService.setEndereco(result.data.usuario);

      this.authService.currentUserSubject.next(result);
      this.disableCadastro = false;

      if (this.companyArea == '1') {
        this.setUpCupom();
      } else {
        this.showDialogDesconto();
      }

    });
  }

  setUpCupom() {
    const dialogRef = this.dialog.open(CupomDialog, {
      width: '400px',
      data: { name: 'as', animal: 'asdasd' },
      disableClose: true
    });
  }

  showDialogDesconto() {
    this.dialog.open(MottuDialog, {
      width: '400px',
      disableClose: true,
      data: {
        data: null,
        message: {
          title: 'Cadastro Realizado com sucesso',
          body: 'Você acaba de ganhar R$35,00 de bonus!'
        }
      }
    });

  }

  setObrigatorio() {
    const tipo = this.companyData.controls.tipoPessoa.value;
    this.companyData.controls.cpf.setValue('');
    this.companyData.controls.cnpj.setValue('');

    this.companyData.controls.cpf.setValidators(Validators.nullValidator);
    this.companyData.controls.cnpj.setValidators(Validators.nullValidator);

    this.companyData.controls.cpf.updateValueAndValidity();
    this.companyData.controls.cnpj.updateValueAndValidity();

    if (tipo == '1') {
      this.companyData.controls.cpf.setValidators(Validators.required);
      this.companyData.controls.cpf.updateValueAndValidity();
    } else {
      this.companyData.controls.cnpj.setValidators(Validators.required);
      this.companyData.controls.cnpj.updateValueAndValidity();
    }
  }

  validate(cnpjInput) {
    let cnpj = cnpjInput.value;

    if (this.util.validaCnpj(cnpj)) {
      this.companyData.controls.cnpj.setErrors({ cnpjInvalido: true });
    }
  }

  validaCpf(cpfInput) {
    let cpf = cpfInput.value;

    if (this.util.validaCpf(cpf)) {
      this.companyData.controls.cpf.setErrors({ cpfInvalido: true });
    }
  }

  checkCnpj() {
    const cnpj = {
      Documento: this.companyData.controls.cnpj.value.replace(/[^\d]+/g, ''),
    };
    this.userService.checkCnpj(cnpj).subscribe((response: any) => {
      if (!response.sucesso) {
        this.companyData.controls.cnpj.setErrors({
          jaExistente: response.mensagem,
        });
      }
    });
  }

  checkCpf() {
    const cpf = {
      Documento: this.companyData.controls.cpf.value.replace(/[^\d]+/g, ''),
    };
    this.userService.checkCnpj(cpf).subscribe((response: any) => {
      if (!response.sucesso) {
        this.companyData.controls.cpf.setErrors({
          jaExistente: response.mensagem,
        });
      }
    });
  }

  validarEndereco() {
    if (this.adressForm.controls.endereco.value == '') {
      this.allowAddOtherAdress = false;
    }
  }

  initAutocomplete() {
    // 5 é numero do input no formulario todo
    const nativeHomeInputBox = document.getElementsByTagName('input')[5];

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

      this.adressForm.controls.cidade.setValue(currentAddress.cidade);
      this.adressForm.controls.estado.setValue(currentAddress.estado);
      this.adressForm.controls.numero.setValue(currentAddress.numero);
      this.adressForm.controls.cep.setValue(currentAddress.cep);

      this.app.tick();

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

  fillInAddress() { }

  sendLater() {
    this.router.navigate(['/pedidos-andamento']);
  }
}
