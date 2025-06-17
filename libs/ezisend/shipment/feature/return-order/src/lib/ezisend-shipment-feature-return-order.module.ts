import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { ReturnOrderComponent } from './return-order.component';
import { EzisendSharedUiLoadingSpinnerModule } from '@pos/ezisend/shared/ui/loading-spinner';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { EzisendShipmentUiReturnOrderFormModule } from '@pos/ezisend/shipment/ui/return-order-form';
export const ezisendShipmentFeatureReturnOrderRoutes: Route[] = [];

@NgModule({
  imports: [CommonModule,EzisendShipmentUiReturnOrderFormModule,PageLayoutModule, EzisendSharedUiLoadingSpinnerModule,RouterModule, RouterModule.forChild([
    { path: '', pathMatch: 'full', component: ReturnOrderComponent },
  ]),],
  declarations: [ReturnOrderComponent],
  exports: [ReturnOrderComponent]
})
export class EzisendShipmentFeatureReturnOrderModule {}

