import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddUserComponent } from './add-user.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { EzisendShipmentUiSearchInputModule } from '@pos/ezisend/shipment/ui/search-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule} from '@angular/material/chips';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@NgModule({
  imports: [CommonModule,FormControlWrapperModule,FormsModule, ReactiveFormsModule,MatIconModule, MatFormFieldModule, MatChipsModule,MatAutocompleteModule,NgxMatSelectSearchModule,MatCardModule,MatButtonModule,MatTableModule, MatDividerModule, EzisendShipmentUiSearchInputModule, MatFormFieldModule, MatSelectModule,MatInputModule, MatProgressSpinnerModule],
  declarations: [AddUserComponent],
  exports: [AddUserComponent],
})
export class EzisendUserManagementUiAddUserFormModule {}