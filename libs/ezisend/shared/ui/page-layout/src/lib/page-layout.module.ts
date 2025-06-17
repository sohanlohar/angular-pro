import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageLayoutComponent } from './page-layout.component';
import { BreadcrumbModule } from '@pos/ezisend/shared/ui/breadcrumb';

@NgModule({
  imports: [CommonModule, BreadcrumbModule],
  declarations: [PageLayoutComponent],
  exports: [PageLayoutComponent],
})
export class PageLayoutModule {}
