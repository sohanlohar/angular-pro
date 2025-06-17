import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingSpinnerComponent } from './loading-spinner.component';

@NgModule({
  imports: [CommonModule, MatProgressSpinnerModule],
  declarations: [LoadingSpinnerComponent],
  exports: [LoadingSpinnerComponent],
})
export class EzisendSharedUiLoadingSpinnerModule {}
