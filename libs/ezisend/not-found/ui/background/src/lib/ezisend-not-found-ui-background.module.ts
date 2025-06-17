import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BackgroundComponent } from './background.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: BackgroundComponent },
    ]),
  ],
  declarations: [BackgroundComponent],
  exports: [BackgroundComponent],
})
export class EzisendNotFoundUiBackgroundModule {}
