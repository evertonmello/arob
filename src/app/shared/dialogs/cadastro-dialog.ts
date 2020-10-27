import { Component, Inject } from '@angular/core';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';

@Component({
    selector: 'cadastro-dialog',
    templateUrl: 'cadastro-dialog.html',
    styles: [`
    .docs-container{
        display: flex;
        justify-content: space-around;
        height: 90px;
        align-items: center;
        background-color: #d8d8d8;
    }
    .container{
        text-align: center;text-align: center;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        height: 100%;
        justify-content: space-around;
    }
    .title{
        font-weight: 900;
        font-size:17px;
    }
    `]
})
export class CadastroDialog {
    constructor(
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
