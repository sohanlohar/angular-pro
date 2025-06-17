import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDialogComponent } from './modal-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  declarations: [ModalDialogComponent],
  exports: [ModalDialogComponent],
})
export class EzisendSharedUiModalDialogModule {}
