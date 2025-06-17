import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from './breadcrumb.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  imports: [CommonModule, RouterModule, MatIconModule],
  declarations: [BreadcrumbComponent],
  exports: [BreadcrumbComponent],
})
export class BreadcrumbModule {}
