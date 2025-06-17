import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavHeaderComponent } from './nav-header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountrySelectModule } from '@pos/ezisend/shared/ui/country-select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {MatChipsModule} from '@angular/material/chips';
import { EzisendShipmentUiDropdownInputModule } from '@pos/ezisend/shipment/ui/dropdown-input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EzisendShipmentUiDateRangePickerModule } from '@pos/ezisend/shipment/ui/date-range-picker';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    CountrySelectModule,
    FormsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatChipsModule,
    EzisendShipmentUiDropdownInputModule,
    EzisendShipmentUiDateRangePickerModule,
    ReactiveFormsModule
  ],
  declarations: [NavHeaderComponent],
  exports: [NavHeaderComponent]

})
export class NavHeaderModule {}
