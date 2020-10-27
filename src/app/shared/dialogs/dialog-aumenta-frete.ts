import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { MottuDialog } from './mottu-dialog';

@Component({
  selector: 'dialog-aumenta-frete',
  templateUrl: 'dialog-aumenta-frete.html',
})
export class ConfirmDialogAlterarFrete {
  public message;
  public novoValor: string;
  public valorAtual: string;
  public showEnderecoLoader = false;

  constructor(
    public dialogRef: MatDialogRef<any>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService) { }


  ngOnInit() {
    this.valorAtual = this.data.valorCorrida;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  alterarFrete() {
    this.showEnderecoLoader = true;

    let idPedido = this.data.id;

    if (this.novoValor <= this.valorAtual) {
      this.showEnderecoLoader = false;
      this.message = "Só é permitido aumentar o valor da corrida";
    }
    else {
      this.authService.atualizaValorCorrida(idPedido, this.novoValor).subscribe((response: any) => {
        this.showEnderecoLoader = false;

        if (!response.sucesso) {
          this.message = response.mensagem;
        } else {
          let ref = this.dialog.open(MottuDialog, {
              width: '400px',
              disableClose: true,
              data: { message: { title: 'Sucesso', body: 'valor da corrida alterado com sucesso' } }
          });

          ref.afterClosed().subscribe(result => {
              this.dialogRef.close();
          });
        }
      })
    }
  }

}
