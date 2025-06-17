import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRangePickerComponent } from './date-range-picker.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    FormControlWrapperModule,
    NgxDaterangepickerMd.forRoot(),
  ],
  declarations: [
    DateRangePickerComponent,
  ],
  exports: [DateRangePickerComponent],
})
export class EzisendShipmentUiDateRangePickerModule {}
