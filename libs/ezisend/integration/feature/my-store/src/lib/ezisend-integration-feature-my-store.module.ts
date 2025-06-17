import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyStoreComponent } from './my-store.component';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { EzisendShipmentUiMyShipmentTableModule } from '@pos/ezisend/shipment/ui/my-shipment-table';

@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,
    EzisendShipmentUiMyShipmentTableModule,

    RouterModule.forChild([
      {path: '', pathMatch: 'full', component: MyStoreComponent} 
    ]),
  ],
  declarations: [MyStoreComponent],
  exports: [MyStoreComponent]
})
export class EzisendIntegrationFeatureMyStoreModule {}
