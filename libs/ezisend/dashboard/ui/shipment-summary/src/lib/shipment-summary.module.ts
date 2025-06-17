import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EzisendDashboardUiCodOrderModule } from '@pos/ezisend/dashboard/ui/cod-order';
import { ShipmentTileModule } from '@pos/ezisend/shared/ui/shipment-tile';
import { EzisendShipmentUiDateRangePickerModule } from '@pos/ezisend/shipment/ui/date-range-picker';
import { ShipmentSummaryComponent } from './shipment-summary.component';

@NgModule({
  imports: [
    CommonModule, 
    ShipmentTileModule, 
    MatIconModule, 
    MatFormFieldModule,
    MatDatepickerModule,
    MatDividerModule,
    ReactiveFormsModule,
    EzisendShipmentUiDateRangePickerModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    EzisendDashboardUiCodOrderModule,
  ],
  declarations: [ShipmentSummaryComponent],
  exports: [ShipmentSummaryComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
})
export class ShipmentSummaryModule {}
