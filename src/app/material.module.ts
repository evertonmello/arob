
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
    exports: [
        MatToolbarModule,
        MatDatepickerModule,
        MatRadioModule,
        MatStepperModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatTableModule,
        MatSelectModule,
        MatCheckboxModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatDialogModule,
        MatProgressBarModule
    ],
    providers: [
        MatDatepickerModule,
        MatNativeDateModule
    ]
})
export class MaterialModule { }