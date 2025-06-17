import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './banner.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  imports: [CommonModule, RouterModule, MatIconModule],
  declarations: [BannerComponent],
  exports: [BannerComponent],
})
export class BannerModule {}
