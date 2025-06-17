import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyShipmentTableComponent } from './my-shipment-table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { EzisendSharedUiPaginatorModule } from '@pos/ezisend/shared/ui/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatProgressBarModule,
    EzisendSharedUiPaginatorModule,
    MatSlideToggleModule,
    FormsModule
  ],
  declarations: [MyShipmentTableComponent],
  exports: [MyShipmentTableComponent],
})
export class EzisendShipmentUiMyShipmentTableModule {}
