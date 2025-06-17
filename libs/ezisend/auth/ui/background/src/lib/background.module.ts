import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from './background.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BackgroundComponent],
  exports: [BackgroundComponent],
})
export class BackgroundModule {}
