import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartInputComponent } from './smart-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormControlWrapperModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatExpansionModule
  ],
  declarations: [SmartInputComponent],
  exports: [SmartInputComponent],
})
export class EzisendShipmentUiSmartInputModule {}
