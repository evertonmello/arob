import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
    selector: 'mottu-dialog',
    templateUrl: 'mottu-dialog.html',
})
export class MottuDialog {

    constructor(
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

}

