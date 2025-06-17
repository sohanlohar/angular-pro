import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BillingInvoiceComponent } from './invoice.component';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { FlexLayoutModule } from "@angular/flex-layout";
import { EzisendShipmentUiMyShipmentTableModule } from '@pos/ezisend/shipment/ui/my-shipment-table';
import {MatTableModule} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { EzisendSharedUiPaginatorModule } from '@pos/ezisend/shared/ui/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,
    FlexLayoutModule,
    EzisendShipmentUiMyShipmentTableModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    EzisendSharedUiPaginatorModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressBarModule,
    RouterModule.forChild([
       {path: '', pathMatch: 'full', redirectTo: 'invoice'},
       {path: 'invoice', pathMatch: 'full', component: BillingInvoiceComponent},

    ]),
  ],
  declarations: [BillingInvoiceComponent],
  exports: [BillingInvoiceComponent],
  providers: [DatePipe] 
})
export class EzisendBillingFeatureInvoiceModule {}
