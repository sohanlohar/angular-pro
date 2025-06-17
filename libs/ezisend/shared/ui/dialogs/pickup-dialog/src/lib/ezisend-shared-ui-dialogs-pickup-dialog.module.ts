import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { PickupDialogComponent } from './pickup-dialog.component';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { EzisendShipmentUiDateRangePickerModule } from '@pos/ezisend/shipment/ui/date-range-picker';


export const DATE_SINGLE_FORMATS = {
  parse: {
    dateInput: 'DD MMM YY',
  },
  display: {
    dateInput: 'DD MMM YY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    EzisendShipmentUiDateRangePickerModule,
  ],
  declarations: [PickupDialogComponent],
  exports: [PickupDialogComponent],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_SINGLE_FORMATS },
  ],
})
export class EzisendSharedUiDialogsPickupDialogModule {}
