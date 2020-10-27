import { Component, OnInit } from '@angular/core';

import { FinanceiroService } from './../../../../shared/services/financeiro.service';
@Component({
  selector: 'app-extrato',
  templateUrl: './extrato.component.html',
  styleUrls: ['./extrato.component.scss']
})
export class ExtratoComponent implements OnInit {

  public extratos;
  public showLoader = true;
  public displayedColumns: string[] = ['id', 'data', 'tipo', 'pedidoId', 'estorno', 'valor'];
  constructor(private financeiroService:FinanceiroService) { }

  ngOnInit() {
    this.getExtratos();
  }

  getExtratos(){
    this.showLoader = true;
    this.financeiroService.getExtrato().subscribe((response:any)=>{
      this.extratos = response.data;
      this.showLoader = false;
    },(error)=>{
      alert(error)
    })
  }
}
