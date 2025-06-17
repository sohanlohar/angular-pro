import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports/reports.component';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { RouterModule } from '@angular/router'
import { EzisendShipmentUiDropdownInputModule } from '@pos/ezisend/shipment/ui/dropdown-input';
import { EzisendShipmentUiDateRangePickerModule } from '@pos/ezisend/shipment/ui/date-range-picker';
import { ReactiveFormsModule } from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,
    EzisendShipmentUiDropdownInputModule,
    EzisendShipmentUiDateRangePickerModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterModule.forChild([
    {path: '', pathMatch: 'full', component: ReportsComponent}
  ])],
  declarations: [ReportsComponent],
  exports: [ReportsComponent]
})
export class ReportsModule {}
