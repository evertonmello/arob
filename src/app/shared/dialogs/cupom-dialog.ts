import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { MottuDialog } from './mottu-dialog';

@Component({
    selector: 'cupom-dialog',
    templateUrl: 'cupom-dialog.html',
})
export class CupomDialog {

    public message;
    public showEnderecoLoader = false;
    public cupom: string;
    constructor(
        public dialogRef: MatDialogRef<any>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data,
        private authService: AuthService) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    validaCupom() {
        this.showEnderecoLoader = true;
        this.authService.ativaCupom({ cupom: this.cupom }).subscribe((response: any) => {
            this.showEnderecoLoader = false;

            if (!response.sucesso) {
                this.message = response.mensagem
            } else {
                let ref = this.dialog.open(MottuDialog, {
                    width: '400px',
                    disableClose: true,
                    data: { message: { title: 'Sucesso', body: 'Cupom Ativado com sucesso' } }
                });

                ref.afterClosed().subscribe(result => {
                    this.dialogRef.close();
                });

            }
        })
    }
}
