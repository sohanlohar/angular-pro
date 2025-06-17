import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactTableComponent } from './contact-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { EzisendSharedUiPaginatorModule } from 'libs/ezisend/shared/ui/paginator/src';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EzisendShipmentUiSearchInputModule } from '@pos/ezisend/shipment/ui/search-input';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatRippleModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatPaginatorModule,
    MatDialogModule,
    RouterModule,
    MatProgressBarModule,
    EzisendSharedUiPaginatorModule,
    EzisendShipmentUiSearchInputModule,
  ],
  declarations: [ContactTableComponent],
  exports: [ContactTableComponent],
})
export class ContactTableModule {}
