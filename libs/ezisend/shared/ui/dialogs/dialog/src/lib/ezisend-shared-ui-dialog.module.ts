import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EzisendIconModule } from '@pos/ezisend/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GeneralFormModule } from '@pos/ezisend/shared/ui/forms/general-form';
import { EzisendShipmentUiDateRangePickerModule } from '@pos/ezisend/shipment/ui/date-range-picker';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    EzisendIconModule,
    GeneralFormModule,
    EzisendShipmentUiDateRangePickerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule
  ],
  declarations: [DialogComponent],
  exports: [DialogComponent],
})
export class EzisendSharedUiDialogModule {}
