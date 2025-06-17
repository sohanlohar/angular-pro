import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AddressFormComponent } from './address-form.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
  ],
  declarations: [AddressFormComponent],
  exports: [AddressFormComponent],
})
export class AddressFormModule {}
