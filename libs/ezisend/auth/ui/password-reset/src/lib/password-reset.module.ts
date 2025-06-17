import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordResetComponent } from './password-reset.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  declarations: [
    PasswordResetComponent
  ],
  exports: [
    PasswordResetComponent
  ],
})
export class PasswordResetModule {}
