import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProfileFormComponent } from './profile-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MatSelectModule } from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TelephoneInputModule } from '@pos/ezisend/shared/ui/telephone-input';
import { CountrySelectModule } from '@pos/ezisend/shared/ui/country-select';
import { EzisendSharedUiLoadingSpinnerModule } from '@pos/ezisend/shared/ui/loading-spinner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    TelephoneInputModule,
    CountrySelectModule,
    EzisendSharedUiLoadingSpinnerModule,
    FormControlWrapperModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    ProfileFormComponent
  ],
  exports: [
    ProfileFormComponent
  ],
})
export class ProfileFormModule {}
