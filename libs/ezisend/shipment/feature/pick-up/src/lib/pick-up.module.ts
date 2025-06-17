import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PickUpComponent } from './pick-up.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: PickUpComponent }]),
  ],
  declarations: [PickUpComponent],
})
export class PickUpModule {}
