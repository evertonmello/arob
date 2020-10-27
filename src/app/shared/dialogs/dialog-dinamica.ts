import { Component, Inject } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

@Component({
  selector: "dialog-dinamica",
  templateUrl: "dialog-dinamica.html",
})
export class DialogDinamica {
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
