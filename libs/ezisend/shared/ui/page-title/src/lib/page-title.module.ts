import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from './page-title.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    PageTitleComponent
  ],
  exports: [
    PageTitleComponent
  ],
})
export class PageTitleModule {}
