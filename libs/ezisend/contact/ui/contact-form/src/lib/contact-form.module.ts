import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from './contact-form.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TelephoneInputModule } from '@pos/ezisend/shared/ui/telephone-input';
import { CountrySelectModule } from '@pos/ezisend/shared/ui/country-select';
import { EzisendSharedUiLoadingSpinnerModule } from '@pos/ezisend/shared/ui/loading-spinner';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TextFieldModule,
    FormsModule,
    ReactiveFormsModule,
    TelephoneInputModule,
    CountrySelectModule,
    EzisendSharedUiLoadingSpinnerModule,
    FormControlWrapperModule,
  ],
  declarations: [ContactFormComponent],
  exports: [ContactFormComponent],
})
export class ContactFormModule {}
