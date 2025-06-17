import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BulkContactComponent } from './contact-bulk-upload.component';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { MatTabsModule } from '@angular/material/tabs';
import { EzisendShipmentUiBulkDomIntlShipmentModule } from '@pos/ezisend/shipment/ui/bulk-dom-intl-shipment';

@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,
    MatTabsModule,
    EzisendShipmentUiBulkDomIntlShipmentModule,
    RouterModule.forChild([
       {path: '', pathMatch: 'full', component: BulkContactComponent} 
    ]),
  ],
  declarations: [BulkContactComponent],
  exports: [BulkContactComponent]
})
export class EzisendContactFeatureContactBulkUploadModule {}
