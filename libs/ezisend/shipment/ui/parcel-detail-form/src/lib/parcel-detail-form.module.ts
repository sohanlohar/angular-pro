import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcelDetailFormComponent } from './parcel-detail-form.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatCardModule} from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { CountrySelectModule } from '@pos/ezisend/shared/ui/country-select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ShippingSelectBoxComponent } from './shipping-select-box/shipping-select-box.component';
import { MpsShipmentDetailsComponent } from './mps/mps-shipment-details/mps-shipment-details.component';
import {MatExpansionModule} from '@angular/material/expansion';
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatStepperModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    CountrySelectModule,
    MatProgressSpinnerModule,
    NgxMatSelectSearchModule,
    MatProgressBarModule,
    FormControlWrapperModule,
    MatExpansionModule,
    MatCardModule
  ],
  declarations: [ParcelDetailFormComponent, ShippingSelectBoxComponent, MpsShipmentDetailsComponent],
  exports: [ParcelDetailFormComponent],
  providers: [
    {
      provide: MatStepper
    }
  ]
})
export class ParcelDetailFormModule {}
