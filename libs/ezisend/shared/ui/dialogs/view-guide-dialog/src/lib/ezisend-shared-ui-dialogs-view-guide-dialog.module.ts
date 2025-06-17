import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ViewGuideDialogComponent } from './view-guide-dialog.component';

@NgModule({
  imports: [CommonModule, MatDialogModule, MatIconModule],
  declarations: [ViewGuideDialogComponent],
  exports: [ViewGuideDialogComponent],
})
export class EzisendSharedUiDialogsViewGuideDialogModule {}
