import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderEditFormComponent } from './order-edit-form.component';
import { RecipientDetailFormModule } from '@pos/ezisend/shipment/ui/recipient-detail-form';
import { ReactiveFormsModule } from '@angular/forms';
import { EzisendSharedUiPickupCardListModule } from '@pos/ezisend/shared/ui/pickup-card-list';
import { ParcelDetailFormModule } from '@pos/ezisend/shipment/ui/parcel-detail-form';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EzisendSharedUiPickupCardListModule,
    ParcelDetailFormModule,
    RecipientDetailFormModule
  ],
  declarations: [OrderEditFormComponent],
  exports: [OrderEditFormComponent],
})
export class EzisendShipmentUiOrderEditFormModule {}
