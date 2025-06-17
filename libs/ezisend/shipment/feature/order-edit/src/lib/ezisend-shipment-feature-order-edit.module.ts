import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { EzisendShipmentUiOrderEditFormModule } from '@pos/ezisend/shipment/ui/order-edit-form';
import { EzisendSharedUiLoadingSpinnerModule } from '@pos/ezisend/shared/ui/loading-spinner';
import { OrderEditComponent } from './order-edit.component';

@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,
    EzisendShipmentUiOrderEditFormModule,
    EzisendSharedUiLoadingSpinnerModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: OrderEditComponent },
    ]),
  ],
  declarations: [OrderEditComponent],
})
export class EzisendShipmentFeatureOrderEditModule {}
