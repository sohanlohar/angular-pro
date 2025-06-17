import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelReaderComponent } from './excel-reader.component';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    FormsModule],
  declarations: [ExcelReaderComponent],
  exports: [ExcelReaderComponent],
})
export class EzisendSharedUiExcelReaderModule {}
