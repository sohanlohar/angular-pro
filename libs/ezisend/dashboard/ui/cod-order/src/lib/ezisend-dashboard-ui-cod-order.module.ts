import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodOrderComponent } from './cod-order.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [CommonModule, MatIconModule],
  declarations: [CodOrderComponent],
  exports: [CodOrderComponent],
})
export class EzisendDashboardUiCodOrderModule {}
