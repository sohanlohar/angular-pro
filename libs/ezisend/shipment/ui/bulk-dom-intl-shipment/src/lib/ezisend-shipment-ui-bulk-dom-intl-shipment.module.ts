import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkDomIntlShipmentComponent } from './bulk-dom-intl-shipment.component';
import {  MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EzisendSharedUiExcelReaderModule } from '@pos/ezisend/shared/ui/excel-reader';

@NgModule({
  imports: [
    CommonModule, 
    MatButtonModule,
    EzisendSharedUiExcelReaderModule,
    MatIconModule
  ],
  declarations: [BulkDomIntlShipmentComponent],
  exports: [BulkDomIntlShipmentComponent],
})
export class EzisendShipmentUiBulkDomIntlShipmentModule {}
