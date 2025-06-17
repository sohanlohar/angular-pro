import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NavFooterComponent } from './nav-footer.component';

@NgModule({
  imports: [CommonModule, RouterModule, MatIconModule],
  declarations: [NavFooterComponent],
  exports: [NavFooterComponent]
})
export class EzisendShellUiNavFooterModule {}
