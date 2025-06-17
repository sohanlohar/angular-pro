import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HistoryComponent } from './history.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: HistoryComponent }]),
  ],
  declarations: [HistoryComponent],
})
export class HistoryModule {}
