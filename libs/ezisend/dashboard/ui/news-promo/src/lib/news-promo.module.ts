import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsPromoComponent } from './news-promo.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, MatProgressSpinnerModule],
  declarations: [NewsPromoComponent],
  exports: [NewsPromoComponent],
})
export class NewsPromoModule {}
