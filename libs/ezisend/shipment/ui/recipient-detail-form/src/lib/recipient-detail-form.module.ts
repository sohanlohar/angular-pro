import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipientDetailFormComponent } from './recipient-detail-form.component';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { TelephoneInputModule } from '@pos/ezisend/shared/ui/telephone-input';
import { CountrySelectModule } from '@pos/ezisend/shared/ui/country-select';
import { EzisendSharedUiLoadingSpinnerModule } from '@pos/ezisend/shared/ui/loading-spinner';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';
import { EzisendShipmentUiSmartInputModule } from '@pos/ezisend/shipment/ui/smart-input';
import { EzisendSharedUiPickupCardListModule } from '@pos/ezisend/shared/ui/pickup-card-list';
import { ParcelDetailFormModule } from '@pos/ezisend/shipment/ui/parcel-detail-form';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    EzisendShipmentUiSmartInputModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    TelephoneInputModule,
    CountrySelectModule,
    EzisendSharedUiLoadingSpinnerModule,
    FormControlWrapperModule,
    MatTabsModule,
  ],
  declarations: [
    RecipientDetailFormComponent
  ],
  exports: [RecipientDetailFormComponent]
})
export class RecipientDetailFormModule {}
