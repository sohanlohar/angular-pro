import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelephoneInputComponent } from './telephone-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';
@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    FormControlWrapperModule
  ],
  declarations: [
    TelephoneInputComponent
  ],
  exports: [
    TelephoneInputComponent
  ],
})
export class TelephoneInputModule {}
