import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { FinanceiroService } from './../../../../shared/services/financeiro.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-dados-bancarios',
  templateUrl: './dados-bancarios.component.html',
  styleUrls: ['./dados-bancarios.component.scss']
})
export class DadosBancariosComponent implements OnInit {

  public contaForm: FormGroup;
  public bancos;
  public selectedBanco;
  public isMatriz = this.auth.isUserMatriz;
  constructor(
    private fb: FormBuilder,
    private financeiroService: FinanceiroService,
    private auth: AuthService
  ) {
    this.contaForm = this.fb.group({
      banco: [''],
      conta: [''],
      agencia: ['']
    })
  }

  ngOnInit() {
    console.log(this.isMatriz)
  }


  getBancos() {
    this.financeiroService.getBancos().subscribe((bancos) => {
      this.bancos = bancos;
    })
  }



  salvaDadosBancarios() {
    let banco = this.contaForm.controls.banco.value;
    let agencia = this.contaForm.controls.agencia.value;
    let conta = this.contaForm.controls.conta.value;

    this.financeiroService.saveDadosBancarios(banco, agencia, conta).subscribe((result) => {
      alert('Dados Salvos com Sucesso')
    })
  }
}
