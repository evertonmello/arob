import { Component, OnInit } from '@angular/core';
import { MeliService } from 'src/app/shared/services/meli.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mercado-livre',
  templateUrl: './mercado-livre.component.html',
  styleUrls: ['./mercado-livre.component.scss'],
})
export class MercadoLivreComponent implements OnInit {
  public currentUser = this.authService.userLogged;
  public shipment;
  public pedidos;
  public allSelected = false;
  public vendaSelected;
  public situacoes = [];
  public checkAll = false;
  public checkedList = [];
  public showLoader = true;
  public selection = new SelectionModel<any>(true, []);
  public displayedColumns: string[] = [
    'checkBox',
    'data',
    'horario',
    'nMercadoLivre',
    'entregaML',
    'nBoraBora',
    // 'entregaAceita',
    // 'entregaRetirada',
    // 'entregaEntregue',
    'detalhes',
  ];

  constructor(
    private meliService: MeliService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.meliService.getEnvios().subscribe(
      (response: any) => {
        this.pedidos = response.data;
        this.showLoader = false;
        this.getEntregaStatus();
      },
      (error) => { }
    );
  }

  getEntregaStatus() {
    let pedido_aceito = false;
    let pedido_retirado = false;
    let pedido_entregue = false;

    this.pedidos.forEach((element) => {
      switch (element.situacao) {
        case 10:
          pedido_aceito = true;
          break;

        case 20:
          pedido_aceito = true;
          pedido_retirado = true;
          break;

        case 30:
          pedido_aceito = true;
          pedido_retirado = true;
          pedido_entregue = true;
          break;

        case 40:
          pedido_aceito = true;
          pedido_retirado = true;
          pedido_entregue = true;
          break;
      }

      this.situacoes.push({
        a: pedido_aceito,
        r: pedido_retirado,
        e: pedido_entregue,
      });
    });
  }

  detalhePedido(pedido) {
    if (pedido.pedidoId) {
      this.router.navigate(['pedido-detalhe/' + pedido.pedidoId]);
    }
  }

  check(item) {
    this.checkedList.push(item);
  }

  updateAllComplete() {
    this.checkAll = !this.checkAll;
  }

  isAllSelected() {
    if (this.pedidos) {
      const numSelected = this.selection.selected.length;
      const numRows = this.pedidos.length || 0;
      return numSelected === numRows;
    }
  }

  masterToggle() {
    this.allSelected
      ? this.selection.clear()
      : this.pedidos.forEach((row) => {
        if (!row.pedidoId) {
          this.selection.select(row);
        }
      });

    this.allSelected = !this.allSelected;
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1
      }`;
  }

  rota() {
    this.showLoader = true;
    const enviosId = [];
    this.selection.selected.forEach((item) => {
      enviosId.push(item.id);
    });

    this.meliService.novaRota(enviosId).subscribe((novaRotaResp: any) => {
      this.meliService.criarPrevia(enviosId).subscribe((response: any) => {
        this.showLoader = false;

        this.router.navigate(['pedido-detalhe/' + response.data.id]);
      });
    });
  }

  reprocessarPedidos() {
    this.showLoader = true;
    this.meliService.reprocessarPedidos(this.currentUser.id).subscribe(
      (response: any) => {
        if (response.sucesso) {
          this.showDialog('Sucesso', response.mensagem);
          this.ngOnInit();
        } else {
          this.showDialog('Falha', response.mensagem);
          this.showLoader = false;
        }
      },
      (error) => {
        this.showDialog('Falha', 'Ocorreu um erro, se persistir contate o suporte.');
        this.showLoader = false;
      }
    );
  }

  processarShipment() {
    if (!this.shipment) {
      this.showDialog('Atençao!', 'Informe o número da venda.');
      return;
    }
    this.showLoader = true;

    this.meliService.processarShipment(this.shipment).subscribe(
      (response: any) => {
        this.ngOnInit();
      },
      (error) => {
        this.showLoader = false;
      }
    );
  }

  showDialog(title, message) {
    this.dialog.open(MottuDialog, {
      width: '400px',
      disableClose: true,
      data: { message: { title, body: message } }
    });
  }
}
