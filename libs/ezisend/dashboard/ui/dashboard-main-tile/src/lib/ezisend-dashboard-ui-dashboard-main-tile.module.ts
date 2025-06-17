import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardMainTileComponent } from './dashboard-main-tile.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, MatButtonModule],
  declarations: [DashboardMainTileComponent],
  exports: [DashboardMainTileComponent],
})
export class EzisendDashboardUiDashboardMainTileModule {}
