import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountrySelectComponent } from './country-select.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    FormsModule
  ],
  declarations: [
    CountrySelectComponent
  ],
  exports: [
    CountrySelectComponent
  ],
})
export class CountrySelectModule {}
