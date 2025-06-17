import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BulkShipmentComponent } from './bulk-shipment.component';
import { EzisendSharedUiExcelReaderModule } from '@pos/ezisend/shared/ui/excel-reader';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { MatTabsModule } from '@angular/material/tabs';
import { EzisendShipmentUiBulkDomIntlShipmentModule } from '@pos/ezisend/shipment/ui/bulk-dom-intl-shipment';

@NgModule({
  imports: [
    CommonModule,
    EzisendSharedUiExcelReaderModule,
    PageLayoutModule,
    MatTabsModule,
    EzisendShipmentUiBulkDomIntlShipmentModule,
    RouterModule.forChild([{ path: '', component: BulkShipmentComponent }]),
  ],
  declarations: [BulkShipmentComponent],
})
export class BulkShipmentModule {}
