import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentTileComponent } from './shipment-tile.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [CommonModule, MatIconModule],
  declarations: [
    ShipmentTileComponent
  ],
  exports: [
    ShipmentTileComponent
  ],
})
export class ShipmentTileModule {}
