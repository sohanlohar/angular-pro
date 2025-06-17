import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivateAccountComponent } from './activate-account.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  declarations: [ActivateAccountComponent],
  exports: [ActivateAccountComponent],
})
export class ActivateAccountModule {}
