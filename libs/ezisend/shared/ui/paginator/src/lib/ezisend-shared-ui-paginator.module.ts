import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from './paginator.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  imports: [CommonModule, MatPaginatorModule],
  declarations: [PaginatorComponent],
  exports: [PaginatorComponent],
})
export class EzisendSharedUiPaginatorModule {}
