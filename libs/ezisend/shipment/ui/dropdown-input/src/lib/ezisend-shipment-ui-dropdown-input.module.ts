import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownInputComponent } from './dropdown-input.component';

@NgModule({
  imports: [CommonModule, MatFormFieldModule, MatSelectModule],
  declarations: [DropdownInputComponent],
  exports: [DropdownInputComponent],
})
export class EzisendShipmentUiDropdownInputModule {}
