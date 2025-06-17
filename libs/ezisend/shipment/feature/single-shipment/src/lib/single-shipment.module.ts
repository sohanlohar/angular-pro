import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleShipmentComponent } from './single-shipment.component';
import { RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { AddressFormModule } from '@pos/ezisend/shipment/ui/address-form';
import { ParcelDetailFormModule } from '@pos/ezisend/shipment/ui/parcel-detail-form';
import { RecipientDetailFormModule } from '@pos/ezisend/shipment/ui/recipient-detail-form';
import { ReactiveFormsModule } from '@angular/forms';
import { EzisendSharedUiPickupCardListModule } from '@pos/ezisend/shared/ui/pickup-card-list';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  imports: [
    CommonModule,
    MatStepperModule,
    PageLayoutModule,
    ReactiveFormsModule,
    AddressFormModule,
    ParcelDetailFormModule,
    EzisendSharedUiPickupCardListModule,
    RecipientDetailFormModule,
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: SingleShipmentComponent }]),
  ],
  declarations: [SingleShipmentComponent],
})
export class SingleShipmentModule {}
