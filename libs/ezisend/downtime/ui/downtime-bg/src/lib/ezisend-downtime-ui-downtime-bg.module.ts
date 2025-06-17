import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DowntimeBackgroundComponent } from './downtime-background/downtime-background.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: DowntimeBackgroundComponent },
    ]),
  ],
  declarations: [DowntimeBackgroundComponent],
  exports: [DowntimeBackgroundComponent]
})
export class EzisendDowntimeUiDowntimeBgModule {}
