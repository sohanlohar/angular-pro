import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { ReturnOrderFormComponent } from './return-order-form.component';
import { RecipientDetailFormModule } from '@pos/ezisend/shipment/ui/recipient-detail-form';
import { ReactiveFormsModule } from '@angular/forms';
import { EzisendSharedUiPickupCardListModule } from '@pos/ezisend/shared/ui/pickup-card-list';
import { ParcelDetailFormModule } from '@pos/ezisend/shipment/ui/parcel-detail-form';

export const ezisendShipmentUiReturnOrderFormRoutes: Route[] = [];

@NgModule({
  imports: [CommonModule, RouterModule, ReactiveFormsModule,
    EzisendSharedUiPickupCardListModule,
    ParcelDetailFormModule,
    RecipientDetailFormModule
],
  declarations: [ReturnOrderFormComponent],
  exports: [ReturnOrderFormComponent]
})
export class EzisendShipmentUiReturnOrderFormModule {}
