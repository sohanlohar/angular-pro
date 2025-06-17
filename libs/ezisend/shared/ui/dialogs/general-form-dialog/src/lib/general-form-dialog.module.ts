import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralFormDialogComponent } from './general-form-dialog.component';
import { GeneralFormModule } from '@pos/ezisend/shared/ui/forms/general-form';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    GeneralFormModule,
    MatDialogModule,
    MatIconModule,
    HttpClientModule
  ],
  declarations: [GeneralFormDialogComponent],
  exports: [GeneralFormDialogComponent],
})
export class GeneralFormDialogModule {}
