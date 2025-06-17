import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralFormComponent } from './general-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    NgxMatSelectSearchModule,
    FormControlWrapperModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  declarations: [GeneralFormComponent],
  exports: [GeneralFormComponent],
})
export class GeneralFormModule {}
