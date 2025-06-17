import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActionTileComponent } from './action-tile.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, RouterModule, MatButtonModule],
  declarations: [ActionTileComponent],
  exports: [ActionTileComponent],
})
export class ActionTileModule {}
