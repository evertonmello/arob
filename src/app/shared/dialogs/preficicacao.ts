import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Utils from '../utils/utils';


@Component({
    selector: 'precificacao-dialog',
    templateUrl: 'precificacao.html',
})
export class PrecificacaoDialog {

    public pricing: FormGroup;
    public pricingOption = "1";
    public util = new Utils();
    public currencyOption = { prefix: 'R$ ', thousands: '.', decimal: ',' };

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
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

    onSelectionChange(radio) {
        this.pricingOption = radio.value;
        this.pricing = this.util.setFormValidator(radio.value, this.pricing, Validators);
      }
    onNoClick(): void {
        this.dialogRef.close();
    }

}

