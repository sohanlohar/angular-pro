import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DowntimeFeatureComponent } from './downtime-feature.component';
import { EzisendDowntimeUiDowntimeBgModule } from '@pos/ezisend/downtime/ui/downtime-bg';

@NgModule({
  imports: [
    CommonModule,
    EzisendDowntimeUiDowntimeBgModule,
    RouterModule.forChild([
      {path: '', pathMatch: 'full', component: DowntimeFeatureComponent}
    ]),
  ],
  declarations: [DowntimeFeatureComponent],
})
export class EzisendDowntimeFeatureDowntimePageModule {}
